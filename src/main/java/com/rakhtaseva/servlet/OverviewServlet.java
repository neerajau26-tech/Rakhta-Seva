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

@WebServlet("/overviewData")
public class OverviewServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sql =
            "SELECT " +
            "COUNT(*) AS total_donors, " +
            "SUM(CASE WHEN eligible = 1 THEN 1 ELSE 0 END) AS eligible_donors, " +
            "COUNT(DISTINCT blood_group) AS blood_groups " +
            "FROM donors";

        try (
            Connection connection = DBConnection.getConnection();
            PreparedStatement statement =
                connection.prepareStatement(sql);
            ResultSet result = statement.executeQuery()
        ) {

            if (result.next()) {

                int totalDonors =
                    result.getInt("total_donors");

                int eligibleDonors =
                    result.getInt("eligible_donors");

                int bloodGroups =
                    result.getInt("blood_groups");

                String json =
                    "{"
                    + "\"totalDonors\":" + totalDonors + ","
                    + "\"eligibleDonors\":" + eligibleDonors + ","
                    + "\"bloodGroups\":" + bloodGroups
                    + "}";

                response.getWriter().write(json);
            }

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);

            response.getWriter().write(
                "{\"error\":\"Unable to load overview data\"}"
            );
        }
    }
}