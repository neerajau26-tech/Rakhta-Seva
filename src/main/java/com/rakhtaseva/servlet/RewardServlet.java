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

@WebServlet("/reward")
public class RewardServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        String donorIdString = request.getParameter("donorId");
        String unitsString = request.getParameter("units");

        try {

            int donorId = Integer.parseInt(donorIdString);
            int units = Integer.parseInt(unitsString);

            if (units <= 0) {
                response.sendRedirect(
                    request.getContextPath()
                    + "/reward.jsp?status=error"
                );
                return;
            }

            // 1 blood unit = 100 points
            int points = units * 100;

            try (Connection connection = DBConnection.getConnection()) {

                // Check donor exists
                String checkSql =
                    "SELECT id FROM donors WHERE id = ?";

                try (PreparedStatement checkStmt =
                         connection.prepareStatement(checkSql)) {

                    checkStmt.setInt(1, donorId);

                    try (ResultSet rs = checkStmt.executeQuery()) {

                        if (!rs.next()) {

                            response.sendRedirect(
                                request.getContextPath()
                                + "/reward.jsp?status=notfound"
                            );

                            return;
                        }
                    }
                }

                // Add blood units and reward points
                String updateSql =
                    "UPDATE donors " +
                    "SET blood_units = COALESCE(blood_units, 0) + ?, " +
                    "reward_points = COALESCE(reward_points, 0) + ? " +
                    "WHERE id = ?";

                try (PreparedStatement updateStmt =
                         connection.prepareStatement(updateSql)) {

                    updateStmt.setInt(1, units);
                    updateStmt.setInt(2, points);
                    updateStmt.setInt(3, donorId);

                    int updated = updateStmt.executeUpdate();

                    if (updated > 0) {

                        System.out.println(
                            "Reward updated successfully"
                        );

                        System.out.println(
                            "Donor ID: " + donorId
                        );

                        System.out.println(
                            "Blood Units Added: " + units
                        );

                        System.out.println(
                            "Reward Points Added: " + points
                        );

                        response.sendRedirect(
                            request.getContextPath()
                            + "/reward.jsp?status=success"
                        );

                    } else {

                        response.sendRedirect(
                            request.getContextPath()
                            + "/reward.jsp?status=error"
                        );
                    }
                }
            }

        } catch (NumberFormatException e) {

            e.printStackTrace();

            response.sendRedirect(
                request.getContextPath()
                + "/reward.jsp?status=error"
            );

        } catch (Exception e) {

            e.printStackTrace();

            response.sendRedirect(
                request.getContextPath()
                + "/reward.jsp?status=error"
            );
        }
    }
}