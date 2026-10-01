package com.rakhtaseva.servlet;

import com.rakhtaseva.DBConnection;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/inventory")
public class InventoryServlet extends HttpServlet {

    /* =========================================================
       GET — LOAD BLOOD INVENTORY
       ========================================================= */

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
            "SELECT blood_group, units " +
            "FROM blood_inventory " +
            "ORDER BY id";

        try (
            Connection connection =
                DBConnection.getConnection();

            PreparedStatement statement =
                connection.prepareStatement(sql);

            ResultSet result =
                statement.executeQuery()
        ) {

            StringBuilder json =
                new StringBuilder("[");

            boolean first = true;

            while (result.next()) {

                if (!first) {
                    json.append(",");
                }

                String group =
                    result.getString("blood_group");

                int units =
                    result.getInt("units");

                int donors =
                    getDonorCount(connection, group);

                String status;

                if (units <= 2) {
                    status = "Critical";
                } else if (units <= 4) {
                    status = "Low";
                } else {
                    status = "Good";
                }

                json.append("{")
                    .append("\"bloodGroup\":\"")
                    .append(escape(group))
                    .append("\",")

                    .append("\"units\":")
                    .append(units)
                    .append(",")

                    .append("\"status\":\"")
                    .append(status)
                    .append("\",")

                    .append("\"donors\":")
                    .append(donors)

                    .append("}");

                first = false;
            }

            json.append("]");

            response.getWriter()
                    .write(json.toString());

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().write(
                "{\"error\":\"Unable to load blood inventory\"}"
            );
        }
    }


    /* =========================================================
       POST — ADD / REMOVE BLOOD UNITS
       ========================================================= */

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String group =
            request.getParameter("group");

        String unitsText =
            request.getParameter("units");

        String action =
            request.getParameter("action");


        /* -----------------------------------------------------
           BASIC VALIDATION
           ----------------------------------------------------- */

        if (
            group == null ||
            group.trim().isEmpty() ||
            unitsText == null ||
            action == null
        ) {

            response.setStatus(400);
            response.getWriter().write("INVALID");
            return;
        }


        int units;

        try {

            units =
                Integer.parseInt(unitsText);

        } catch (NumberFormatException e) {

            response.setStatus(400);
            response.getWriter().write("INVALID");
            return;
        }


        if (
            units <= 0 ||
            (!action.equals("add") &&
             !action.equals("remove"))
        ) {

            response.setStatus(400);
            response.getWriter().write("INVALID");
            return;
        }


        /* -----------------------------------------------------
           DATABASE CONNECTION
           ----------------------------------------------------- */

        try (
            Connection connection =
                DBConnection.getConnection()
        ) {


            /* =================================================
               ADD UNITS
               ================================================= */

            if (action.equals("add")) {

                String sql =
                    "UPDATE blood_inventory " +
                    "SET units = units + ? " +
                    "WHERE blood_group = ?";

                try (
                    PreparedStatement statement =
                        connection.prepareStatement(sql)
                ) {

                    statement.setInt(
                        1,
                        units
                    );

                    statement.setString(
                        2,
                        group.trim()
                    );

                    int rows =
                        statement.executeUpdate();


                    if (rows == 0) {

                        response.getWriter()
                                .write("NOT_FOUND");

                        return;
                    }


                    response.getWriter()
                            .write("SUCCESS");

                    return;
                }
            }


            /* =================================================
               REMOVE UNITS
               ================================================= */

            String checkSql =
                "SELECT units " +
                "FROM blood_inventory " +
                "WHERE blood_group = ?";


            int currentUnits;


            try (
                PreparedStatement checkStatement =
                    connection.prepareStatement(checkSql)
            ) {

                checkStatement.setString(
                    1,
                    group.trim()
                );


                try (
                    ResultSet result =
                        checkStatement.executeQuery()
                ) {

                    if (!result.next()) {

                        response.getWriter()
                                .write("NOT_FOUND");

                        return;
                    }


                    currentUnits =
                        result.getInt("units");
                }
            }


            /* -------------------------------------------------
               CHECK AVAILABLE STOCK
               ------------------------------------------------- */

            if (units > currentUnits) {

                int shortage =
                    units - currentUnits;


                /*
                 * Format:
                 *
                 * INSUFFICIENT_STOCK|requested|available|shortage
                 */

                response.getWriter().write(
                    "INSUFFICIENT_STOCK|" +
                    units + "|" +
                    currentUnits + "|" +
                    shortage
                );

                return;
            }


            /* -------------------------------------------------
               REMOVE UNITS
               ------------------------------------------------- */

            String removeSql =
                "UPDATE blood_inventory " +
                "SET units = units - ? " +
                "WHERE blood_group = ?";


            try (
                PreparedStatement statement =
                    connection.prepareStatement(removeSql)
            ) {

                statement.setInt(
                    1,
                    units
                );

                statement.setString(
                    2,
                    group.trim()
                );


                int rows =
                    statement.executeUpdate();


                if (rows == 0) {

                    response.getWriter()
                            .write("NOT_FOUND");

                    return;
                }


                response.getWriter()
                        .write("SUCCESS");
            }


        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);

            response.getWriter()
                    .write("ERROR");
        }
    }


    /* =========================================================
       COUNT ELIGIBLE DONORS
       ========================================================= */

    private int getDonorCount(
            Connection connection,
            String group)
            throws Exception {

        String sql =
            "SELECT COUNT(*) " +
            "FROM donors " +
            "WHERE blood_group = ? " +
            "AND eligible = 1";


        try (
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {

            statement.setString(
                1,
                group
            );


            try (
                ResultSet result =
                    statement.executeQuery()
            ) {

                if (result.next()) {

                    return result.getInt(1);
                }
            }
        }


        return 0;
    }


    /* =========================================================
       JSON ESCAPE
       ========================================================= */

    private String escape(String value) {

        if (value == null) {
            return "";
        }

        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r");
    }
}