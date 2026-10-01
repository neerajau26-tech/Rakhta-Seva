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
import java.sql.Date;

@WebServlet("/registerDonor")
public class DonorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        int age = Integer.parseInt(request.getParameter("age"));
        double weight = Double.parseDouble(request.getParameter("weight"));
        String bloodGroup = request.getParameter("bloodGroup");
        String phone = request.getParameter("phone");
        String email = request.getParameter("email");
        String location = request.getParameter("location");

        String lastDonation = request.getParameter("lastDonation");
        String medicalNotes = request.getParameter("medicalNotes");

        // Check donor eligibility
        boolean eligible = age >= 18 && weight >= 50;

        // Do NOT save ineligible donors
        if (!eligible) {
            response.setStatus(400);
            response.setContentType("text/plain");
            response.getWriter().write("NOT_ELIGIBLE");
            return;
        }

        String sql =
                "INSERT INTO donors " +
                "(name, age, weight, blood_group, phone, email, location, " +
                "last_donation, medical_notes, eligible) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement =
                        connection.prepareStatement(sql)
        ) {

            statement.setString(1, name);
            statement.setInt(2, age);
            statement.setDouble(3, weight);
            statement.setString(4, bloodGroup);
            statement.setString(5, phone);
            statement.setString(6, email);
            statement.setString(7, location);

            if (lastDonation == null || lastDonation.trim().isEmpty()) {
                statement.setNull(8, java.sql.Types.DATE);
            } else {
                statement.setDate(8, Date.valueOf(lastDonation));
            }

            if (medicalNotes == null || medicalNotes.trim().isEmpty()) {
                statement.setNull(9, java.sql.Types.LONGVARCHAR);
            } else {
                statement.setString(9, medicalNotes);
            }

            statement.setBoolean(10, true);

            statement.executeUpdate();

            System.out.println("DONOR INSERTED INTO MYSQL");

            response.setContentType("text/plain");
            response.getWriter().write("SUCCESS");

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);
            response.setContentType("text/plain");
            response.getWriter().println(
                    "Registration failed: " + e.getMessage()
            );
        }
    }
}