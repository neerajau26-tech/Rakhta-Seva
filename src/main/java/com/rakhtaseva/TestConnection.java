package com.rakhtaseva;

import java.sql.Connection;

public class TestConnection {

    public static void main(String[] args) {

        try {
            Connection connection = DBConnection.getConnection();

            System.out.println("MySQL connection successful!");

            connection.close();

        } catch (Exception e) {
            System.out.println("Connection failed!");
            e.printStackTrace();
        }
    }
}