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

@WebServlet("/requestContact")
public class ContactRequestServlet extends HttpServlet {

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String donorId = request.getParameter("donorId");
        String requesterName = request.getParameter("requesterName");
        String requesterEmail = request.getParameter("requesterEmail");
        String message = request.getParameter("message");

        if (donorId == null ||
            requesterName == null ||
            requesterName.trim().isEmpty() ||
            requesterEmail == null ||
            requesterEmail.trim().isEmpty()) {

            response.setStatus(400);
            response.getWriter().write("INVALID");
            return;
        }

        String sql =
            "INSERT INTO contact_requests " +
            "(donor_id, requester_name, requester_email, message) " +
            "VALUES (?, ?, ?, ?)";

        try (
            Connection connection = DBConnection.getConnection();
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {

            statement.setInt(1, Integer.parseInt(donorId));
            statement.setString(2, requesterName.trim());
            statement.setString(3, requesterEmail.trim());
            statement.setString(4, message);

            statement.executeUpdate();

            response.getWriter().write("SUCCESS");

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(500);
            response.getWriter().write("ERROR");
        }
    }
}