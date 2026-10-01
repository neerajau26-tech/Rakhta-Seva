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

@WebServlet("/camps")
public class CampServlet extends HttpServlet {

    // ================================
    // GET — LOAD CAMPS
    // ================================

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
            "SELECT id, name, date, location, organizer " +
            "FROM camps " +
            "ORDER BY date ASC";

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

                json.append("{")

                    .append("\"id\":")
                    .append(result.getInt("id"))
                    .append(",")

                    .append("\"name\":\"")
                    .append(
                        escape(result.getString("name"))
                    )
                    .append("\",")

                    .append("\"date\":\"")
                    .append(result.getDate("date"))
                    .append("\",")

                    .append("\"location\":\"")
                    .append(
                        escape(result.getString("location"))
                    )
                    .append("\",")

                    .append("\"organizer\":\"")
                    .append(
                        escape(result.getString("organizer"))
                    )
                    .append("\"")

                    .append("}");

                first = false;
            }

            json.append("]");

            response.getWriter().write(
                json.toString()
            );

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);

            response.getWriter().write(
                "{\"error\":\"Unable to load camps\"}"
            );
        }
    }


    // ================================
    // POST — ADD CAMP
    // ================================

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String name =
            request.getParameter("name");

        String date =
            request.getParameter("date");

        String location =
            request.getParameter("location");

        String organizer =
            request.getParameter("organizer");


        if (name == null ||
            name.trim().isEmpty() ||

            date == null ||
            date.trim().isEmpty() ||

            location == null ||
            location.trim().isEmpty()) {

            response.setStatus(400);

            response.getWriter().write(
                "INVALID"
            );

            return;
        }


        String sql =
            "INSERT INTO camps " +
            "(name, date, location, organizer) " +
            "VALUES (?, ?, ?, ?)";


        try (
            Connection connection =
                DBConnection.getConnection();

            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {

            statement.setString(
                1,
                name.trim()
            );

            statement.setString(
                2,
                date
            );

            statement.setString(
                3,
                location.trim()
            );

            statement.setString(
                4,
                organizer
            );

            statement.executeUpdate();

            response.getWriter().write(
                "SUCCESS"
            );

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);

            response.getWriter().write(
                "ERROR"
            );
        }
    }


    // ================================
    // ESCAPE JSON
    // ================================

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