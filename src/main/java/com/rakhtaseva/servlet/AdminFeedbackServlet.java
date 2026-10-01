package com.rakhtaseva.servlet;

import com.rakhtaseva.DBConnection;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/adminFeedback")
public class AdminFeedbackServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
            "SELECT id, name, rating, message, created_at " +
            "FROM feedback_entries " +
            "ORDER BY created_at DESC";

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            PrintWriter out = response.getWriter()
        ) {

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {

                if (!first) {
                    json.append(",");
                }

                json.append("{");

                json.append("\"id\":")
                    .append(rs.getInt("id"))
                    .append(",");

                json.append("\"name\":\"")
                    .append(escapeJson(rs.getString("name")))
                    .append("\",");

                json.append("\"rating\":")
                    .append(rs.getInt("rating"))
                    .append(",");

                json.append("\"message\":\"")
                    .append(escapeJson(rs.getString("message")))
                    .append("\",");

                json.append("\"createdAt\":\"")
                    .append(escapeJson(rs.getString("created_at")))
                    .append("\"");

                json.append("}");

                first = false;
            }

            json.append("]");

            out.print(json.toString());

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().print(
                "{\"error\":\"Could not load feedback\"}"
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
            .replace("\r", "\\r")
            .replace("\n", "\\n")
            .replace("\t", "\\t");
    }
}