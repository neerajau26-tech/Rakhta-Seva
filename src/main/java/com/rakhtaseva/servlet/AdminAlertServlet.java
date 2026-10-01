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

@WebServlet("/adminAlerts")
public class AdminAlertServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
                "SELECT id, blood_group, location, hospital, " +
                "contact, message, urgent, created_at " +
                "FROM emergency_alerts " +
                "ORDER BY id DESC";

        StringBuilder json = new StringBuilder();
        json.append("[");

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement =
                        connection.prepareStatement(sql);
                ResultSet result = statement.executeQuery()
        ) {

            boolean first = true;

            while (result.next()) {

                if (!first) {
                    json.append(",");
                }

                first = false;

                json.append("{");

                json.append("\"id\":")
                    .append(result.getInt("id"))
                    .append(",");

                json.append("\"bloodGroup\":\"")
                    .append(escapeJson(result.getString("blood_group")))
                    .append("\",");

                json.append("\"location\":\"")
                    .append(escapeJson(result.getString("location")))
                    .append("\",");

                json.append("\"hospital\":\"")
                    .append(escapeJson(result.getString("hospital")))
                    .append("\",");

                json.append("\"contact\":\"")
                    .append(escapeJson(result.getString("contact")))
                    .append("\",");

                json.append("\"message\":\"")
                    .append(escapeJson(result.getString("message")))
                    .append("\",");

                json.append("\"urgent\":")
                    .append(result.getBoolean("urgent"))
                    .append(",");

                json.append("\"createdAt\":\"")
                    .append(escapeJson(result.getString("created_at")))
                    .append("\"");

                json.append("}");
            }

            json.append("]");

            response.getWriter().write(json.toString());

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);
            response.getWriter().write(
                    "{\"error\":\"Could not load emergency alerts\"}"
            );
        }
    }

    private String escapeJson(String value) {

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