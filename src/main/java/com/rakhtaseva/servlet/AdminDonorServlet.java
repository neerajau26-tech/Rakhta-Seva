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

@WebServlet("/adminDonors")
public class AdminDonorServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
                "SELECT id, name, age, weight, blood_group, phone, " +
                "location, last_donation, medical_notes, eligible, created_at " +
                "FROM donors ORDER BY id DESC";

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

                json.append("\"name\":\"")
                    .append(escapeJson(result.getString("name")))
                    .append("\",");

                json.append("\"age\":")
                    .append(result.getInt("age"))
                    .append(",");

                json.append("\"weight\":")
                    .append(result.getDouble("weight"))
                    .append(",");

                json.append("\"bloodGroup\":\"")
                    .append(escapeJson(result.getString("blood_group")))
                    .append("\",");

                json.append("\"phone\":\"")
                    .append(escapeJson(result.getString("phone")))
                    .append("\",");

                json.append("\"location\":\"")
                    .append(escapeJson(result.getString("location")))
                    .append("\",");

                json.append("\"lastDonation\":\"")
                    .append(escapeJson(result.getString("last_donation")))
                    .append("\",");

                json.append("\"medicalNotes\":\"")
                    .append(escapeJson(result.getString("medical_notes")))
                    .append("\",");

                json.append("\"eligible\":")
                    .append(result.getBoolean("eligible"))
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
                    "{\"error\":\"Could not load donors\"}"
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