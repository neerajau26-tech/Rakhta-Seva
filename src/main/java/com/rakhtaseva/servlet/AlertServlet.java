package com.rakhtaseva.servlet;

import com.rakhtaseva.DBConnection;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/alerts")
public class AlertServlet extends HttpServlet {

    // CREATE ALERT
    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String bloodGroup = request.getParameter("bloodGroup");
        String location = request.getParameter("location");
        String unitsParam = request.getParameter("units");

        if (bloodGroup == null || bloodGroup.trim().isEmpty()
                || location == null || location.trim().isEmpty()
                || unitsParam == null || unitsParam.trim().isEmpty()) {

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("MISSING_FIELDS");
            return;
        }

        int units;

        try {
            units = Integer.parseInt(unitsParam);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("INVALID_UNITS");
            return;
        }

        if (units < 1) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("INVALID_UNITS");
            return;
        }

        String sql = """
            INSERT INTO emergency_alerts
            (blood_group, location, hospital, contact, message, urgent)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     sql,
                     Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, bloodGroup.trim());
            ps.setString(2, location.trim());

            // For now the form only gives hospital/location.
            ps.setString(3, location.trim());

            // Contact and message are not present in the current form.
            ps.setNull(4, Types.VARCHAR);
            ps.setString(5, units + " unit(s) of " + bloodGroup + " blood required.");
            ps.setBoolean(6, true);

            int rows = ps.executeUpdate();

            if (rows == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("FAILED");
                return;
            }

            int alertId = 0;

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    alertId = rs.getInt(1);
                }
            }

            // Count eligible donors matching the blood group.
            int matchedDonors = 0;

            String donorSql = """
                SELECT COUNT(*)
                FROM donors
                WHERE blood_group = ?
                AND eligible = 1
                """;

            try (PreparedStatement donorPs = con.prepareStatement(donorSql)) {

                donorPs.setString(1, bloodGroup.trim());

                try (ResultSet rs = donorPs.executeQuery()) {
                    if (rs.next()) {
                        matchedDonors = rs.getInt(1);
                    }
                }
            }

            response.getWriter().write(
                "SUCCESS|" + alertId + "|" + matchedDonors
            );

        } catch (SQLException e) {
            e.printStackTrace();

            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().write("DATABASE_ERROR");
        }
    }

    // GET ALERTS
    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        List<String> alerts = new ArrayList<>();

        String sql = """
            SELECT id, blood_group, location, hospital,
                   contact, message, urgent, created_at
            FROM emergency_alerts
            ORDER BY created_at DESC
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                String json =
                    "{"
                    + "\"id\":" + rs.getInt("id") + ","
                    + "\"bloodGroup\":\"" + escapeJson(rs.getString("blood_group")) + "\","
                    + "\"location\":\"" + escapeJson(rs.getString("location")) + "\","
                    + "\"hospital\":\"" + escapeJson(rs.getString("hospital")) + "\","
                    + "\"contact\":\"" + escapeJson(rs.getString("contact")) + "\","
                    + "\"message\":\"" + escapeJson(rs.getString("message")) + "\","
                    + "\"urgent\":" + rs.getBoolean("urgent") + ","
                    + "\"createdAt\":\"" + escapeJson(String.valueOf(rs.getTimestamp("created_at"))) + "\""
                    + "}";

                alerts.add(json);
            }

            response.getWriter().write("[" + String.join(",", alerts) + "]");

        } catch (SQLException e) {
            e.printStackTrace();

            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().write("[]");
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