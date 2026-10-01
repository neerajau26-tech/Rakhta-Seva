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

@WebServlet("/searchDonors")
public class SearchDonorServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        String bloodGroup = request.getParameter("bloodGroup");
        String location = request.getParameter("location");

        if (bloodGroup == null) {
            bloodGroup = "";
        }

        if (location == null) {
            location = "";
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
    "SELECT id, name, age, weight, blood_group, phone, " +
    "location, last_donation, medical_notes, eligible " +
    "FROM donors " +
    "WHERE eligible = 1";

if (!bloodGroup.isEmpty()) {
    sql += " AND blood_group = ?";
}

if (!location.isEmpty()) {
    sql += " AND location LIKE ?";
}

sql += " ORDER BY name";

          

        try (
            Connection connection = DBConnection.getConnection();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            System.out.println("=== SEARCH DEBUG ===");
System.out.println("Database: " +
        connection.getCatalog());

PreparedStatement debugStatement =
        connection.prepareStatement(
            "SELECT COUNT(*) FROM donors WHERE eligible = 1"
        );

ResultSet debugResult = debugStatement.executeQuery();

if (debugResult.next()) {
    System.out.println(
        "Eligible donor count: " +
        debugResult.getInt(1)
    );
}

debugResult.close();
debugStatement.close();

System.out.println("====================");
int parameterIndex = 1;

if (!bloodGroup.isEmpty()) {
    statement.setString(parameterIndex++, bloodGroup);
}

if (!location.isEmpty()) {
    statement.setString(parameterIndex++, "%" + location + "%");
}

            ResultSet result = statement.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (result.next()) {

                if (!first) {
                    json.append(",");
                }

                json.append("{")
                    .append("\"id\":")
                    .append(result.getInt("id"))
                    .append(",")

                    .append("\"name\":\"")
                    .append(escape(result.getString("name")))
                    .append("\",")

                    .append("\"age\":")
                    .append(result.getInt("age"))
                    .append(",")

                    .append("\"weight\":")
                    .append(result.getDouble("weight"))
                    .append(",")

                    .append("\"bloodGroup\":\"")
                    .append(escape(result.getString("blood_group")))
                    .append("\",")

                    .append("\"phone\":\"")
                    .append(escape(result.getString("phone")))
                    .append("\",")

                    .append("\"location\":\"")
                    .append(escape(result.getString("location")))
                    .append("\",")

                    .append("\"lastDonation\":\"")
                    .append(
                        result.getDate("last_donation") == null
                            ? ""
                            : result.getDate("last_donation").toString()
                    )
                    .append("\",")

                    .append("\"medicalNotes\":\"")
                    .append(escape(result.getString("medical_notes")))
                    .append("\",")

                    .append("\"eligible\":")
                    .append(result.getBoolean("eligible"))

                    .append("}");

                first = false;
            }

            json.append("]");

            response.getWriter().write(json.toString());

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);

            response.getWriter().write(
                "{\"error\":\"" + escape(e.getMessage()) + "\"}"
            );
        }
    }

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