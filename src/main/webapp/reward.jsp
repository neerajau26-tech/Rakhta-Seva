<%@ page language="java"
contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>

<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <title>Admin - Donor Rewards</title>


<style>
    body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f5f6fa;
    }

    .container {
        width: 500px;
        margin: 60px auto;
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    h2 {
        text-align: center;
        color: #b30000;
        margin-bottom: 30px;
    }

    label {
        display: block;
        margin-top: 18px;
        font-weight: bold;
    }

    input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        margin-top: 7px;
        border: 1px solid #ccc;
        border-radius: 7px;
        font-size: 15px;
    }

    .points-box {
        margin-top: 20px;
        padding: 18px;
        background: #fff1f1;
        border-radius: 10px;
        text-align: center;
    }

    .points {
        font-size: 30px;
        font-weight: bold;
        color: #b30000;
    }

    button {
        width: 100%;
        padding: 13px;
        margin-top: 25px;
        border: none;
        border-radius: 7px;
        background: #b30000;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }

    button:hover {
        background: #8f0000;
    }

    .rule {
        margin-top: 20px;
        text-align: center;
        color: #555;
    }

    .success {
        color: green;
        text-align: center;
        font-weight: bold;
    }

    .error {
        color: red;
        text-align: center;
        font-weight: bold;
    }
</style>

</head>

<body>

<div class="container">

```
<h2>🎁 Donor Reward Management</h2>

<% if ("success".equals(request.getParameter("status"))) { %>
    <p class="success">
        Reward points added successfully!
    </p>
<% } %>

<% if ("error".equals(request.getParameter("status"))) { %>
    <p class="error">
        Failed to update reward points.
    </p>
<% } %>

<!-- IMPORTANT: /reward, NOT /admin/reward -->
<form action="${pageContext.request.contextPath}/reward"
      method="post">

    <label for="donorId">
        Donor ID
    </label>

    <input
        type="number"
        id="donorId"
        name="donorId"
        min="1"
        required
        placeholder="Enter donor ID"
    >

    <label for="units">
        Blood Units Donated
    </label>

    <input
        type="number"
        id="units"
        name="units"
        min="1"
        required
        placeholder="Enter number of units"
        oninput="calculatePoints()"
    >

    <div class="points-box">
        <div>Reward Points</div>

        <div class="points">
            <span id="points">0</span>
        </div>

        <div>1 unit = 100 points</div>
    </div>

    <button type="submit">
        Award Reward
    </button>

</form>

<div class="rule">
    <strong>Reward Rule:</strong><br>
    Every 1 blood unit = 100 points
</div>
```

</div>

<script>
function calculatePoints() {

    let units = document.getElementById("units").value;

    if (units === "" || units < 0) {
        units = 0;
    }

    let points = parseInt(units) * 100;

    document.getElementById("points").innerText = points;
}
</script>

</body>
</html>
