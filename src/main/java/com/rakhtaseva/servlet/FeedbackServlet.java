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

@WebServlet("/feedback")
public class FeedbackServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        StringBuilder json = new StringBuilder("[");

        String sql =
            "SELECT id, name, rating, message, created_at " +
            "FROM feedback_entries ORDER BY id DESC";

        try (
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
        ) {
            boolean first = true;

            while (rs.next()) {

                if (!first) {
                    json.append(",");
                }

                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"")
                    .append(escape(rs.getString("name"))).append("\",")
                    .append("\"rating\":").append(rs.getInt("rating")).append(",")
                    .append("\"message\":\"")
                    .append(escape(rs.getString("message"))).append("\",")
                    .append("\"createdAt\":\"")
                    .append(escape(rs.getString("created_at"))).append("\"")
                    .append("}");

                first = false;
            }

            json.append("]");

            response.getWriter().print(json.toString());

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

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String name = request.getParameter("name");
        String ratingText = request.getParameter("rating");
        String message = request.getParameter("message");

        if (name == null || name.trim().isEmpty()
                || ratingText == null
                || message == null || message.trim().isEmpty()) {

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("INVALID");
            return;
        }

        int rating;

        try {
            rating = Integer.parseInt(ratingText);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("INVALID");
            return;
        }

        if (rating < 1 || rating > 5) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("INVALID");
            return;
        }

        String sql =
            "INSERT INTO feedback_entries (name, rating, message) " +
            "VALUES (?, ?, ?)";

        try (
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {
            ps.setString(1, name.trim());
            ps.setInt(2, rating);
            ps.setString(3, message.trim());

            int rows = ps.executeUpdate();

            if (rows > 0) {
                response.getWriter().print("SUCCESS");
            } else {
                response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
                );
                response.getWriter().print("ERROR");
            }

        } catch (Exception e) {
            e.printStackTrace();

            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().print("ERROR");
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
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}