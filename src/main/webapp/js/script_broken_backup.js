/* =========================================================
   RAKHTA SEVA — script.js
   Frontend + Java Servlet + MySQL
   ========================================================= */


/* =========================================================
   DOMAIN MODEL — plain OOP classes
   ========================================================= */

class Person {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
  }

  describe() {
    return `${this.name}`;
  }
}


class Donor extends Person {
  constructor({
    name,
    phone,
    age,
    weight,
    bloodGroup,
    location,
    lastDonation,
    healthNotes
  }) {
    super(name, phone);

    this.id = Donor.nextId();
    this.age = Number(age);
    this.weight = Number(weight);
    this.bloodGroup = bloodGroup;
    this.location = location;
    this.lastDonation = lastDonation || "";
    this.healthNotes = healthNotes || "";
    this.donations = 0;
    this.createdAt = new Date().toISOString();
  }

  static nextId() {
    const current =
      Number(localStorage.getItem("donorNextId") || "1");

    localStorage.setItem(
      "donorNextId",
      String(current + 1)
    );

    return `KL-${String(current).padStart(4, "0")}`;
  }

  isEligible() {
    return (
      this.age >= 18 &&
      this.weight >= 50
    );
  }

  rewardTier() {
    if (this.donations >= 10) return "Platinum";
    if (this.donations >= 5) return "Gold";
    if (this.donations >= 3) return "Silver";
    return "Bronze";
  }
}


/* =========================================================
   ADMIN
   ========================================================= */

class Admin extends Person {
  constructor(name, phone) {
    super(name, phone);
  }

  describe() {
    return `Admin: ${this.name}`;
  }
}


/* =========================================================
   BLOOD BANK
   ========================================================= */

class BloodBank {
  constructor() {
    this.inventory = {
      "O+": 8,
      "O-": 3,
      "A+": 6,
      "A-": 2,
      "B+": 5,
      "B-": 2,
      "AB+": 4,
      "AB-": 1
    };
  }

  getUnits(group) {
    return Number(this.inventory[group] || 0);
  }

  add(group, units) {
    units = Number(units);

    if (!this.inventory[group]) {
      this.inventory[group] = 0;
    }

    this.inventory[group] += units;
  }

  remove(group, units) {
    units = Number(units);

    if (!this.inventory[group]) {
      this.inventory[group] = 0;
    }

    this.inventory[group] =
      Math.max(
        0,
        this.inventory[group] - units
      );
  }

  status(group) {
    const units = this.getUnits(group);

    if (units <= 2) return "Critical";
    if (units <= 4) return "Low";

    return "Good";
  }
}


/* =========================================================
   CAMP
   ========================================================= */

class Camp {
  constructor({
    name,
    location,
    date,
    organization
  }) {
    this.id =
      `CAMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    this.name = name;
    this.location = location;
    this.date = date;
    this.organization = organization;
    this.createdAt = new Date().toISOString();
  }
}


/* =========================================================
   EMERGENCY ALERT
   ========================================================= */

class EmergencyAlert {
  constructor({
    bloodGroup,
    location,
    units
  }) {
    this.id =
      `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    this.bloodGroup = bloodGroup;
    this.location = location;
    this.units = Number(units);
    this.createdAt = new Date().toISOString();
    this.notified = 0;
  }
}


/* =========================================================
   FEEDBACK
   ========================================================= */

class Feedback {
  constructor({
    name,
    rating,
    message
  }) {
    this.id =
      `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    this.name = name;
    this.rating = Number(rating);
    this.message = message;
    this.createdAt = new Date().toISOString();
  }
}


/* =========================================================
   REGISTRY — MAIN CONTROLLER
   ========================================================= */

class Registry {

  constructor() {
    this.donors = [];
    this.bank = new BloodBank();
    this.camps = [];
    this.alerts = [];
    this.feedback = [];
  }


  /* -------------------------------------------------------
     LOAD DATA
     ------------------------------------------------------- */

  async load() {

    const donors =
      await safeGet("donors");

    if (donors && donors.value) {

      try {

        this.donors =
          JSON.parse(donors.value);

      } catch (error) {

        console.error(
          "Donor data error:",
          error
        );

        this.donors = [];
      }
    }


    const inventory =
      await safeGet("inventory");

    if (inventory && inventory.value) {

      try {

        this.bank.inventory =
          JSON.parse(inventory.value);

      } catch (error) {

        console.error(
          "Inventory data error:",
          error
        );
      }
    }


    const camps =
      await safeGet("camps");

    if (camps && camps.value) {

      try {

        this.camps =
          JSON.parse(camps.value);

      } catch (error) {

        console.error(
          "Camp data error:",
          error
        );

        this.camps = [];
      }
    }


    const alerts =
      await safeGet("alerts");

    if (alerts && alerts.value) {

      try {

        this.alerts =
          JSON.parse(alerts.value);

      } catch (error) {

        console.error(
          "Alert data error:",
          error
        );

        this.alerts = [];
      }
    }


    const feedback =
      await safeGet("feedback");

    if (feedback && feedback.value) {

      try {

        this.feedback =
          JSON.parse(feedback.value);

      } catch (error) {

        console.error(
          "Feedback data error:",
          error
        );

        this.feedback = [];
      }
    }
  }


  /* -------------------------------------------------------
     SAVE DONORS
     ------------------------------------------------------- */

  async saveDonors() {

    localStorage.setItem(
      "donors",
      JSON.stringify(this.donors)
    );
  }


  /* -------------------------------------------------------
     SAVE BANK
     ------------------------------------------------------- */

  async saveBank() {

    localStorage.setItem(
      "inventory",
      JSON.stringify(
        this.bank.inventory
      )
    );
  }


  /* -------------------------------------------------------
     SAVE CAMPS
     ------------------------------------------------------- */

  async saveCamps() {

    localStorage.setItem(
      "camps",
      JSON.stringify(this.camps)
    );
  }


  /* -------------------------------------------------------
     SAVE ALERTS
     ------------------------------------------------------- */

  async saveAlerts() {

    localStorage.setItem(
      "alerts",
      JSON.stringify(this.alerts)
    );
  }


  /* -------------------------------------------------------
     SAVE FEEDBACK
     ------------------------------------------------------- */

  async saveFeedback() {

    localStorage.setItem(
      "feedback",
      JSON.stringify(this.feedback)
    );
  }


  /* -------------------------------------------------------
     FIND RAREST BLOOD GROUP
     ------------------------------------------------------- */

  rarestGroup() {

    if (!this.donors.length) {
      return null;
    }

    const counts = {};

    this.donors.forEach(donor => {

      counts[donor.bloodGroup] =
        (counts[donor.bloodGroup] || 0) + 1;

    });

    let rarest = null;
    let lowest = Infinity;

    Object.keys(counts).forEach(group => {

      if (counts[group] < lowest) {

        lowest = counts[group];
        rarest = group;

      }

    });

    return rarest;
  }


  /* -------------------------------------------------------
     MATCH DONORS
     ------------------------------------------------------- */

  matchDonors(group, location) {

    return this.donors.filter(donor => {

      const groupMatch =
        donor.bloodGroup === group;

      const locationMatch =
        !location ||
        String(donor.location || "")
          .toLowerCase()
          .includes(
            location.toLowerCase()
          );

      return (
        groupMatch &&
        locationMatch &&
        donor.age >= 18 &&
        donor.weight >= 50
      );
    });
  }
}


/* =========================================================
   STORAGE HELPER
   ========================================================= */

async function safeGet(key) {

  try {

    const value =
      localStorage.getItem(key);

    return value === null
      ? null
      : { value };

  } catch (error) {

    console.error(
      "Local storage read failed:",
      error
    );

    return null;
  }
}


/* =========================================================
   GLOBAL REGISTRY
   ========================================================= */

const registry =
  new Registry();


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   MESSAGE HELPER
   ========================================================= */

function showMessage(
  element,
  message,
  type = "success"
) {

  if (!element) return;

  element.textContent = message;

  element.className =
    `msg ${type}`;
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function activateSection(target) {

  document
    .querySelectorAll("main section")
    .forEach(section => {

      section.classList.toggle(
        "active",
        section.id === target
      );

    });


  document
    .querySelectorAll("#nav button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.target === target
      );

    });

}


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

document
  .querySelectorAll("button[data-target]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        activateSection(
          button.dataset.target
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  });


/* =========================================================
   HOME RENDER
   ========================================================= */

async function renderHome() {

  const total = $("homeStats");

  if (!total) return;

  try {

    const response = await fetch(
      "overviewData",
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "Overview data from database:",
      data
    );

    total.innerHTML = `

      <div class="stat">
        <strong>${data.totalDonors}</strong>
        <span>Registered donors</span>
      </div>

      <div class="stat">
        <strong>${data.eligibleDonors}</strong>
        <span>Eligible donors</span>
      </div>

      <div class="stat">
        <strong>${data.bloodGroups}</strong>
        <span>Blood groups</span>
      </div>

      <div class="stat">
        <strong>0</strong>
        <span>Available units</span>
      </div>

    `;

  } catch (error) {

    console.error(
      "Overview data error:",
      error
    );

    total.innerHTML = `
      <div class="empty">
        Could not load overview data.
      </div>
    `;
  }
}


/* =========================================================
   DONOR ROW
   ========================================================= */

function donorRowHTML(donor) {

  const eligible =
    donor.age >= 18 &&
    donor.weight >= 50;


  return `

    <div class="reg-item">

      <div>

        <strong>
          ${escapeHTML(donor.name)}
        </strong>

        <div class="muted">
          ${escapeHTML(donor.bloodGroup)}
          ·
          ${escapeHTML(donor.location)}
        </div>

      </div>

      <div class="reg-meta">

        <span>
          ${eligible
            ? "Eligible"
            : "Not eligible"}
        </span>

        <span>
          ${escapeHTML(donor.id)}
        </span>

      </div>

    </div>

  `;
}


/* =========================================================
   WORKFLOW TABLE
   ========================================================= */

function renderWorkflow() {

  const box = $("workflowTable");

  if (!box) return;

  box.innerHTML = `

    <div class="workflow-step">

      <div class="workflow-number">
        1
      </div>

      <div>
        <strong>
          A donor registers with age, weight,
          blood group and location.
        </strong>
      </div>

    </div>

    <div class="workflow-step">

      <div class="workflow-number">
        2
      </div>

      <div>
        <strong>
          A hospital or patient raises an
          emergency alert for a group and location.
        </strong>
      </div>

    </div>

    <div class="workflow-step">

      <div class="workflow-number">
        3
      </div>

      <div>
        <strong>
          The registry finds eligible donors,
          nearest matches first.
        </strong>
      </div>

    </div>

    <div class="workflow-step">

      <div class="workflow-number">
        4
      </div>

      <div>
        <strong>
          Matched donors are marked notified
          and can be reached directly.
        </strong>
      </div>

    </div>

  `;
}


/* =========================================================
   SEARCH RENDER — MYSQL / JAVA SERVLET
   ========================================================= */

async function renderSearch() {

  const group =
    $("s_group")?.value || "";


  const loc =
    $("s_location")?.value.trim() || "";


  const el =
    $("searchResults");


  if (!el) return;




  try {

    const url =
      `searchDonors?bloodGroup=${encodeURIComponent(group)}&location=${encodeURIComponent(loc)}`;


    console.log(
      "Searching:",
      url
    );


    const response =
      await fetch(url, {

        method: "GET",

        headers: {
          "Accept": "application/json"
        },

        cache: "no-store"

      });


    if (!response.ok) {

      throw new Error(
        `Server returned ${response.status}`
      );

    }


    const results =
      await response.json();


    console.log(
      "Search results:",
      results
    );


    if (
      !Array.isArray(results) ||
      results.length === 0
    ) {

      el.innerHTML =
        `<div class="empty">
          No eligible donors found.
        </div>`;

      return;
    }


    el.innerHTML =
      results
        .map(donor => {

          const eligible =
            donor.eligible === true ||
            donor.eligible === 1;


          return `

            <div class="reg-item">

              <div>

                <strong>
                  ${escapeHTML(donor.name)}
                </strong>

                <div class="muted">
                  ${escapeHTML(donor.bloodGroup)}
                  ·
                  ${escapeHTML(donor.location)}
                </div>

                <div class="muted">
                  Age: ${donor.age}
                  ·
                  Weight: ${donor.weight} kg
                </div>

                <div class="muted">
                  Phone:
                  ${escapeHTML(donor.phone)}
                </div>

              </div>


              <div class="reg-meta">

                <span>
                  ${eligible
                    ? "Eligible"
                    : "Not eligible"}
                </span>

                <span>
                  ID: ${donor.id}
                </span>

                <button
                  class="btn btn-outline btn-sm"
                  onclick="requestContact('${escapeHTML(donor.id)}')">
                  Request contact
                </button>

              </div>

            </div>

          `;

        })
        .join("");

  } catch (error) {

    console.error(
      "Donor search error:",
      error
    );


    el.innerHTML =
      `<div class="empty">
        Could not connect to the server.
      </div>`;
  }
}


/* =========================================================
   REQUEST CONTACT
   ========================================================= */

async function requestContact(donorId) {

    const requesterName = prompt("Enter your name:");

    if (!requesterName || !requesterName.trim()) {
        return;
    }

    const requesterEmail = prompt("Enter your email address:");

    if (!requesterEmail || !requesterEmail.trim()) {
        return;
    }

    const message = prompt(
        "Enter a message for the donor (optional):"
    ) || "";

    try {

        const response = await fetch("requestContact", {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },
            body:
                `donorId=${encodeURIComponent(donorId)}` +
                `&requesterName=${encodeURIComponent(requesterName.trim())}` +
                `&requesterEmail=${encodeURIComponent(requesterEmail.trim())}` +
                `&message=${encodeURIComponent(message)}`
        });

        const result = await response.text();

        console.log("Contact request response:", result);

        if (result.trim() === "SUCCESS") {

            alert(
                "Contact request sent successfully!"
            );

        } else if (result.trim() === "INVALID") {

            alert(
                "Please enter your name and email."
            );

        } else {

            alert(
                "Failed to send contact request."
            );
        }

    } catch (error) {

        console.error("Contact request error:", error);

        alert(
            "Unable to send contact request."
        );
    }
}


/* =========================================================
   ELIGIBILITY POPUP
   ========================================================= */


function showEligibilityModal(age, weight) {

  const modal = $("eligibilityModal");
  const message = $("eligibilityMessage");

  if (!modal || !message) {
    console.error("Eligibility modal not found in HTML.");
    return;
  }

  age = Number(age);
  weight = Number(weight);

  if (age < 18 && weight < 50) {

    message.textContent =
      "Registration cannot be completed. You must be at least 18 years old and weigh at least 50 kg.";

  } else if (age < 18) {

    message.textContent =
      "Registration cannot be completed. You must be at least 18 years old.";

  } else if (weight < 50) {

    message.textContent =
      "Registration cannot be completed. You must weigh at least 50 kg.";

  }

  modal.classList.add("show");
}


/* =========================================================
   CLOSE ELIGIBILITY POPUP
   ========================================================= */

function closeEligibilityModal() {

  const modal =
    $("eligibilityModal");


  if (modal) {

    modal.classList.remove("show");

  }
}


/* =========================================================
   CLOSE POPUP WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
  "click",
  function(event) {

    const modal =
      $("eligibilityModal");


    if (!modal) return;


    if (
      event.target === modal &&
      modal.classList.contains("show")
    ) {

      closeEligibilityModal();

    }

  }
);


/* =========================================================
   DONOR REGISTRATION — JAVA SERVLET + MYSQL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const donorForm = document.getElementById("donorForm");

  if (!donorForm) {
    console.error("donorForm not found!");
    return;
  }

  console.log("Donor form connected successfully.");

  donorForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("REGISTER BUTTON CLICKED");

    const age = Number(
      document.getElementById("f_age").value || 0
    );

    const weight = Number(
      document.getElementById("f_weight").value || 0
    );

    console.log("Age:", age);
    console.log("Weight:", weight);

    /* -------------------------------------------------------
       ELIGIBILITY CHECK
       ------------------------------------------------------- */

    if (age < 18 || weight < 50) {

      console.log("DONOR NOT ELIGIBLE");

      showEligibilityModal(age, weight);

      return;
    }

    /* -------------------------------------------------------
       PREPARE DATA
       ------------------------------------------------------- */

    const data = new URLSearchParams();

    data.append(
      "name",
      document.getElementById("f_name").value.trim()
    );

    data.append(
      "age",
      document.getElementById("f_age").value
    );

    data.append(
      "weight",
      document.getElementById("f_weight").value
    );

    data.append(
      "bloodGroup",
      document.getElementById("f_group").value
    );
data.append(
  "phone",
  document.getElementById("f_phone").value.trim()
);

data.append(
  "email",
  document.getElementById("f_email").value.trim()
);

data.append(
  "location",
  document.getElementById("f_location").value.trim()
);

    data.append(
      "lastDonation",
      document.getElementById("f_lastdonation").value
    );

    data.append(
      "medicalNotes",
      document.getElementById("f_health").value.trim()
    );

    console.log("Sending data to Java servlet...");

    /* -------------------------------------------------------
       SEND TO JAVA
       ------------------------------------------------------- */

    try {

      const response = await fetch("registerDonor", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: data.toString()
      });

      const result = await response.text();

      console.log("Java response:", result);

      /* -----------------------------------------------------
         NOT ELIGIBLE FROM BACKEND
         ----------------------------------------------------- */

      if (result.trim() === "NOT_ELIGIBLE") {

        showEligibilityModal(age, weight);

        return;
      }

      /* -----------------------------------------------------
         SERVER ERROR
         ----------------------------------------------------- */

      if (!response.ok) {

        console.error(
          "Server error:",
          result
        );

        showMessage(
          document.getElementById("regMsg"),
          result || "Registration failed.",
          "error"
        );

        return;
      }

      /* -----------------------------------------------------
         SUCCESS
         ----------------------------------------------------- */

     if (result.trim() === "SUCCESS") {

  console.log("DONOR REGISTERED SUCCESSFULLY");

  donorForm.reset();

  showRegistrationSuccessModal();

  return;
}

      console.log("Unexpected response:", result);

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      showMessage(
        document.getElementById("regMsg"),
        "Could not connect to the server.",
        "error"
      );
    }

  });

});
function showRegistrationSuccessModal() {

  const modal = document.createElement("div");

  modal.id = "registrationSuccessModal";
  modal.className = "modal-overlay show";
  modal.setAttribute("aria-hidden", "false");

  modal.innerHTML = `
    <div class="eligibility-modal">

      <button
        type="button"
        class="modal-close"
        onclick="closeRegistrationSuccessModal()"
        aria-label="Close"
      >
        ×
      </button>

      <div class="modal-icon">✓</div>

      <h2>Registration Successful!</h2>

      <p>
        Your donor registration has been saved successfully.
      </p>

      <button
        type="button"
        class="btn btn-primary modal-ok"
        onclick="closeRegistrationSuccessModal()"
      >
        Okay
      </button>

    </div>
  `;

  document.body.appendChild(modal);
}


function closeRegistrationSuccessModal() {

  const modal = document.getElementById("registrationSuccessModal");

  if (modal) {
    modal.remove();
  }

}

/* =========================================================
   SEARCH FORM
   ========================================================= */

$("s_group")?.addEventListener(
  "change",
  renderSearch
);


$("s_location")?.addEventListener(
  "input",
  renderSearch
);


/* =========================================================
   BLOOD BANK — JAVA SERVLET + MYSQL
   ========================================================= */

async function renderBank() {

  const table = $("bankTable");

  if (!table) return;

  try {

    const response = await fetch("inventory", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const inventory = await response.json();

    console.log(
      "Blood inventory from database:",
      inventory
    );

    if (
      !Array.isArray(inventory) ||
      inventory.length === 0
    ) {

      table.innerHTML = `
        <tr>
          <td colspan="5">
            No blood inventory available.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML = inventory
      .map(item => {

        const units =
          Number(item.units || 0);

        /*
         * Level bar:
         * 0 units  = 0%
         * 1 unit   = 10%
         * 5 units  = 50%
         * 10+ units = 100%
         */
        const percentage =
          Math.min(units * 10, 100);

        return `

          <tr>

            <td>
              <strong>
                ${escapeHTML(item.bloodGroup)}
              </strong>
            </td>

            <td>
              ${units} units
            </td>

            <td>
              <div class="inventory-level">
                <div
                  class="inventory-level-fill"
                  style="width:${percentage}%">
                </div>
              </div>
            </td>

            <td>
              <span class="badge">
                ${escapeHTML(item.status)}
              </span>
            </td>

            <td>
              ${Number(item.donors || 0)}
            </td>

          </tr>

        `;

      })
      .join("");

  } catch (error) {

    console.error(
      "Blood inventory error:",
      error
    );

    table.innerHTML = `
      <tr>
        <td colspan="5">
          Could not load blood inventory.
        </td>
      </tr>
    `;
  }
}

/* =========================================================
   UPDATE BLOOD INVENTORY
   ========================================================= */

async function updateInventory(group, units, action) {

  if (!group) {

    alert("Please select a blood group.");

    return;
  }


  if (!units || units <= 0) {

    alert("Please enter a valid number of units.");

    return;
  }


  const data =
    new URLSearchParams();


  data.append(
    "group",
    group
  );


  data.append(
    "units",
    String(units)
  );


  data.append(
    "action",
    action
  );


  try {

    const response =
      await fetch("inventory", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          data.toString()

      });


    const result = 
  (await response.text()).trim();

console.log(
  "Inventory response:",
  JSON.stringify(result)
);




    /* =====================================================
       SUCCESS
       ===================================================== */

    if (
      result.trim() ===
      "SUCCESS"
    ) {

      if (action === "add") {

        alert(
          units +
          " blood unit(s) added successfully!"
        );

      } else {

        alert(
          units +
          " blood unit(s) removed successfully!"
        );
      }


      await renderBank();

      return;
    }


    /* =====================================================
       INVALID
       ===================================================== */

    if (
      result.trim() ===
      "INVALID"
    ) {

      alert(
        "Please enter valid inventory details."
      );

      return;
    }


    /* =====================================================
       BLOOD GROUP NOT FOUND
       ===================================================== */

    if (
      result.trim() ===
      "NOT_FOUND"
    ) {

      alert(
        "Blood group was not found in the inventory."
      );

      return;
    }


    /* =====================================================
       NOT ENOUGH STOCK
       ===================================================== */

    if (
  result.trim().startsWith(
    "INSUFFICIENT_STOCK|"
  )
) {

      const parts =
        result.trim().split("|");


      const requested =
        Number(parts[1]);


      const available =
        Number(parts[2]);


      const shortage =
        Number(parts[3]);


      alert(
        "⚠️ Cannot remove " +
        requested +
        " unit(s).\n\n" +

        "Available stock: " +
        available +
        " unit(s)\n" +

        "Requested: " +
        requested +
        " unit(s)\n" +

        "Shortage: " +
        shortage +
        " unit(s)"
      );


      return;
    }


    /* =====================================================
       SERVER ERROR
       ===================================================== */

    alert(
      "Could not update blood inventory."
    );


  } catch (error) {

    console.error(
      "Inventory update error:",
      error
    );


    alert(
      "Could not connect to the server."
    );
  }
}
document.getElementById("inv_add")?.addEventListener("click", async function () {
  const group = document.getElementById("inv_group")?.value || "";
  const units = Number(document.getElementById("inv_units")?.value || 0);

  await updateInventory(group, units, "add");
});

document.getElementById("inv_remove")?.addEventListener("click", async function () {
  const group = document.getElementById("inv_group")?.value || "";
  const units = Number(document.getElementById("inv_units")?.value || 0);

  await updateInventory(group, units, "remove");
});

/* =========================================================
   CAMPS — JAVA SERVLET + MYSQL
   ========================================================= */

async function renderCamps() {

  const box = $("campList");

  if (!box) return;

  try {

    const response = await fetch("camps", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const camps = await response.json();

    console.log(
      "Camps from database:",
      camps
    );

    if (!Array.isArray(camps) || camps.length === 0) {

      box.innerHTML = `
        <div class="muted">
          No camps registered yet.
        </div>
      `;

      return;
    }

    box.innerHTML = camps.map(camp => `

      <div class="reg-item">

        <div>

          <strong>
            ${escapeHTML(camp.name)}
          </strong>

          <div class="muted">
            ${escapeHTML(camp.location)}
          </div>

          <div class="muted">
            Date: ${escapeHTML(camp.date)}
          </div>

          <div class="muted">
            Organiser:
            ${escapeHTML(camp.organizer)}
          </div>

        </div>

        <div class="reg-meta">
          CAMP-${camp.id}
        </div>

      </div>

    `).join("");

  } catch (error) {

    console.error(
      "Camp loading error:",
      error
    );

    box.innerHTML = `
      <div class="empty">
        Could not load camps.
      </div>
    `;
  }
}


/* =========================================================
   ADD CAMP — JAVA SERVLET + MYSQL
   ========================================================= */

document
  .getElementById("campForm")
  ?.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name =
      $("c_name").value.trim();

    const location =
      $("c_location").value.trim();

    const date =
      $("c_date").value;

    const organizer =
      $("c_org").value.trim();


    console.log("CAMP FORM VALUES:");
    console.log("Name:", name);
    console.log("Location:", location);
    console.log("Date:", date);
    console.log("Organizer:", organizer);


    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (!name || !location || !date) {

      alert(
        "Please fill in camp name, location and date."
      );

      return;
    }


    /* -------------------------------------------------------
       PREPARE DATA
       ------------------------------------------------------- */

    const data =
      new URLSearchParams();

    data.append(
      "name",
      name
    );

    data.append(
      "date",
      date
    );

    data.append(
      "location",
      location
    );

    data.append(
      "organizer",
      organizer
    );


    /* -------------------------------------------------------
       SEND TO JAVA SERVLET
       ------------------------------------------------------- */

    try {

      const response =
        await fetch("camps", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body:
            data.toString()

        });


      const result =
        await response.text();


      console.log(
        "Camp response:",
        result
      );


      /* -----------------------------------------------------
         SUCCESS
         ----------------------------------------------------- */

      if (result.trim() === "SUCCESS") {

        alert(
          "Camp added successfully!"
        );


        $("c_name").value = "";
        $("c_location").value = "";
        $("c_date").value = "";
        $("c_org").value = "";


        await renderCamps();

        return;
      }


      /* -----------------------------------------------------
         INVALID
         ----------------------------------------------------- */

      if (result.trim() === "INVALID") {

        alert(
          "Please fill in all required fields."
        );

        return;
      }


      /* -----------------------------------------------------
         ERROR
         ----------------------------------------------------- */

      alert(
        "Could not add the camp."
      );

    } catch (error) {

      console.error(
        "Add camp error:",
        error
      );

      alert(
        "Could not connect to the server."
      );

    }

  });


/* =========================================================
   ALERTS RENDER
   ========================================================= */
async function renderAlerts() {
  const box = $("alertLog");

  if (!box) return;

  try {
    const response = await fetch("alerts", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    const alerts = await response.json();

    if (!Array.isArray(alerts) || alerts.length === 0) {
      box.innerHTML =
        `<div class="muted">No emergency alerts yet.</div>`;
      return;
    }

    box.innerHTML = alerts.map(alert => `
      <div class="reg-item">
        <div>
          <strong>
            ${escapeHTML(alert.bloodGroup)}
            —
            Emergency request
          </strong>

          <div class="muted">
            ${escapeHTML(alert.location)}
          </div>

          <div class="muted">
            ${escapeHTML(alert.message || "")}
          </div>
        </div>

        <div class="reg-meta">
          ${escapeHTML(alert.createdAt || "")}
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Alert loading error:", error);

    box.innerHTML =
      `<div class="muted">Unable to load alerts.</div>`;
  }
}

document.getElementById("alertForm")?.addEventListener("submit", async function (event) {

  event.preventDefault();

  const group =
    document.getElementById("a_group")?.value || "";

  const location =
    document.getElementById("a_location")?.value.trim() || "";

  const units =
    Number(document.getElementById("a_units")?.value || 0);

  const msg =
    document.getElementById("alertMsg");

  if (!group || !location || units < 1) {

    showMessage(
      msg,
      "Please fill all required fields.",
      "error"
    );

    return;
  }

  try {

    const body = new URLSearchParams();

    body.append("bloodGroup", group);
    body.append("location", location);
    body.append("units", units);

    const response = await fetch("alerts", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    const result = await response.text();

    console.log("Alert response:", result);

    if (result.startsWith("SUCCESS|")) {

      const parts = result.split("|");

      const alertId = parts[1];
      const matchedDonors = Number(parts[2] || 0);

      showMessage(
        msg,
        `Emergency alert sent successfully. ${matchedDonors} eligible donor(s) match ${group}.`,
        "success"
      );

      document.getElementById("alertForm").reset();

      document.getElementById("a_units").value = 1;

      await renderAlerts();

      // Refresh admin data if needed
      if (
        document.getElementById("adminPanel")?.style.display === "block"
      ) {
        renderAdmin();
      }

    } else if (result === "MISSING_FIELDS") {

      showMessage(
        msg,
        "Please fill all required fields.",
        "error"
      );

    } else if (result === "INVALID_UNITS") {

      showMessage(
        msg,
        "Units must be at least 1.",
        "error"
      );

    } else {

      showMessage(
        msg,
        "Unable to send emergency alert.",
        "error"
      );
    }

  } catch (error) {

    console.error("Alert submit error:", error);

    showMessage(
      msg,
      "Server error. Please try again.",
      "error"
    );
  }
});

async function renderRewards() {

  const box = $("leaderboard");

  if (!box) return;

  box.innerHTML = `
    <div class="muted">
      Loading leaderboard...
    </div>
  `;

  try {

    const response = await fetch("rewards", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const donors = await response.json();

    console.log("Rewards data from database:", donors);

    if (!Array.isArray(donors) || donors.length === 0) {

      box.innerHTML = `
        <div class="muted">
          No donors on leaderboard yet.
        </div>
      `;

      return;
    }

    box.innerHTML = donors
      .slice(0, 10)
      .map((donor, index) => {

        const points = Number(donor.points || 0);
        const level = donor.level || "Bronze";

        return `
          <div class="reg-item">

            <div>

              <strong>
                ${index + 1}.
                ${escapeHTML(donor.name)}
              </strong>

              <div class="muted">
                ${escapeHTML(donor.bloodGroup)}
                ·
                ${points} points
              </div>

            </div>

            <div class="reg-meta">
              ${escapeHTML(level)}
            </div>

          </div>
        `;

      })
      .join("");

  } catch (error) {

    console.error("Rewards loading error:", error);

    box.innerHTML = `
      <div class="muted">
        Could not load rewards data.
      </div>
    `;
  }
}

/* =========================================================
   FEEDBACK — MYSQL DATABASE
   ========================================================= */

async function renderFeedback() {
  const box = $("feedbackList");

  if (!box) return;

  box.innerHTML = `
    <div class="muted">Loading feedback...</div>
  `;

  try {
    const response = await fetch("feedback", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Could not load feedback");
    }

    const feedback = await response.json();

    if (!Array.isArray(feedback) || feedback.length === 0) {
      box.innerHTML = `
        <div class="muted">No feedback yet.</div>
      `;
      return;
    }

    box.innerHTML = feedback.map(item => {
      const rating = Math.max(
        1,
        Math.min(5, Number(item.rating) || 1)
      );

      return `
        <div class="reg-item">
          <div>
            <strong>${escapeHTML(item.name)}</strong>

            <div class="stars" aria-label="${rating} out of 5 stars">
              ${"★".repeat(rating)}${"☆".repeat(5 - rating)}
            </div>

            <div class="muted">
              ${escapeHTML(item.message)}
            </div>
          </div>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("Feedback loading error:", error);

    box.innerHTML = `
      <div class="muted">Unable to load feedback.</div>
    `;
  }
}


/* =========================================================
   SUBMIT FEEDBACK — MYSQL DATABASE
   ========================================================= */

document.getElementById("feedbackForm")
  ?.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = $("fb_name")?.value.trim() || "";
    const rating = $("fb_rating")?.value || "5";
    const message = $("fb_message")?.value.trim() || "";

    if (!name || !message) {
      alert("Please enter your name and feedback message.");
      return;
    }

    const data = new URLSearchParams();
    data.append("name", name);
    data.append("rating", rating);
    data.append("message", message);

    const button = this.querySelector(
      'button[type="submit"]'
    );

    if (button) button.disabled = true;

    try {
      const response = await fetch("feedback", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body: data.toString()
      });

      const result = await response.text();

      if (!response.ok || result.trim() !== "SUCCESS") {
        throw new Error("Feedback could not be saved.");
      }

      this.reset();

      alert("Thank you! Your feedback has been submitted.");

      await renderFeedback();

    } catch (error) {
      console.error("Feedback submission error:", error);

      alert("Unable to submit feedback. Please try again.");
    } finally {
      if (button) button.disabled = false;
    }
  });
/* =========================================================
   ADMIN RENDER
   ========================================================= */

async function renderAdmin() {

  const stats = $("adminStats");

  if (!stats) return;

  let overview = null;
  let inventory = [];
  let camps = [];
  let alerts = [];

  /* =========================================================
     LOAD DATABASE DATA
     ========================================================= */

  try {

    // -------------------------
    // Donor statistics
    // -------------------------
    const overviewResponse = await fetch("overviewData", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!overviewResponse.ok) {
      throw new Error("Could not load overview data");
    }

    overview = await overviewResponse.json();


    // -------------------------
    // Blood inventory
    // -------------------------
    const inventoryResponse = await fetch("inventory", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!inventoryResponse.ok) {
      throw new Error("Could not load inventory");
    }

    inventory = await inventoryResponse.json();


    // -------------------------
    // Camps
    // -------------------------
    const campsResponse = await fetch("camps", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!campsResponse.ok) {
      throw new Error("Could not load camps");
    }

    camps = await campsResponse.json();


    // -------------------------
    // Emergency alerts
    // -------------------------
    const alertsResponse = await fetch("adminAlerts", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!alertsResponse.ok) {
      throw new Error("Could not load alerts");
    }

    alerts = await alertsResponse.json();

    console.log(
      "Admin alerts from database:",
      alerts
    );


    // -------------------------
    // Calculate blood units
    // -------------------------
    const totalUnits = Array.isArray(inventory)
      ? inventory.reduce(
          (sum, item) =>
            sum + Number(item.units || 0),
          0
        )
      : 0;


    // -------------------------
    // Render statistics
    // -------------------------
    stats.innerHTML = `

      <div class="stat">
        <strong>
          ${Number(overview?.totalDonors || 0)}
        </strong>
        <span>
          Donors
        </span>
      </div>

      <div class="stat">
        <strong>
          ${Array.isArray(camps)
            ? camps.length
            : 0}
        </strong>
        <span>
          Camps
        </span>
      </div>

      <div class="stat">
        <strong>
          ${Array.isArray(alerts)
            ? alerts.length
            : 0}
        </strong>
        <span>
          Alerts
        </span>
      </div>

      <div class="stat">
        <strong>
          ${totalUnits}
        </strong>
        <span>
          Blood units
        </span>
      </div>

    `;

  } catch (error) {

    console.error(
      "Admin statistics error:",
      error
    );

    stats.innerHTML = `
      <div class="stat">
        <strong>—</strong>
        <span>Donors</span>
      </div>

      <div class="stat">
        <strong>—</strong>
        <span>Camps</span>
      </div>

      <div class="stat">
        <strong>—</strong>
        <span>Alerts</span>
      </div>

      <div class="stat">
        <strong>—</strong>
        <span>Blood units</span>
      </div>
    `;
  }


  /* =========================================================
     ADMIN DONOR LIST
     ========================================================= */

  const donorList = $("adminDonorList");

  if (donorList) {

    try {

      const donorResponse = await fetch("adminDonors", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });

      if (!donorResponse.ok) {
        throw new Error(
          "Server returned " +
          donorResponse.status
        );
      }

      const donors =
        await donorResponse.json();

      console.log(
        "Admin donors from database:",
        donors
      );

      donorList.innerHTML =
        Array.isArray(donors) &&
        donors.length
          ? donors
              .map(donorRowHTML)
              .join("")
          : `
              <div class="muted">
                No donors registered.
              </div>
            `;

    } catch (error) {

      console.error(
        "Admin donor list error:",
        error
      );

      donorList.innerHTML = `
        <div class="muted">
          Could not load donors.
        </div>
      `;
    }
  }


  /* =========================================================
     ADMIN ALERT LIST
     ========================================================= */

  const alertList =
    $("adminAlertList");

  if (alertList) {

    if (
      Array.isArray(alerts) &&
      alerts.length
    ) {

      alertList.innerHTML =
        alerts
          .map(alert => `

            <div class="reg-item">

              <div>

                <strong>
                  ${escapeHTML(
                    alert.bloodGroup
                  )}
                  —
                  ${alert.urgent
                    ? "URGENT"
                    : "Alert"}
                </strong>

                <div class="muted">
                  ${escapeHTML(
                    alert.location
                  )}
                </div>

                <div class="muted">
                  ${escapeHTML(
                    alert.message || ""
                  )}
                </div>

              </div>

              <div class="reg-meta">
                ${escapeHTML(
                  alert.createdAt || ""
                )}
              </div>

            </div>

          `)
          .join("");

    } else {

      alertList.innerHTML = `
        <div class="muted">
          No emergency alerts yet.
        </div>
      `;
    }
  }


/* =========================================================
   ADMIN FEEDBACK LIST - DATABASE
   ========================================================= */

const feedbackList = $("adminFeedbackList");

if (feedbackList) {

  try {

    const response = await fetch("adminFeedback", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Server returned " + response.status
      );
    }

    const feedback = await response.json();

    console.log("Feedback from database:", feedback);

    if (Array.isArray(feedback) && feedback.length > 0) {

      feedbackList.innerHTML = feedback.map(item => `

        <div class="reg-item">

          <div>

            <strong>
              ${escapeHTML(item.name || "")}
            </strong>

            <div class="stars">
              ${"★".repeat(Number(item.rating || 0))}
            </div>

            <div class="muted">
              ${escapeHTML(item.message || "")}
            </div>

            <div class="muted">
              ${escapeHTML(item.createdAt || "")}
            </div>

          </div>

        </div>

      `).join("");

    } else {

      feedbackList.innerHTML = `
        <div class="muted">
          No feedback yet.
        </div>
      `;
    }

  } catch (error) {

    console.error("Feedback loading error:", error);

    feedbackList.innerHTML = `
      <div class="muted">
        Could not load feedback.
      </div>
    `;
  }
}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

$("adminUnlock")?.addEventListener(
  "click",
  () => {

    const password =
      $("adminPass")?.value || "";


    if (
      password ===
      "admin123"
    ) {

      $("adminLocked").style.display =
        "none";


      $("adminPanel").style.display =
        "block";


      renderAdmin();

    }

    else {

      showMessage(
        $("adminMsg"),
        "Incorrect passcode.",
        "error"
      );

    }

  }
);



/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

  renderHome();
  renderWorkflow();
  renderSearch();
  renderBank();
  renderCamps();
  renderAlerts();
  renderRewards();
  renderFeedback();
  renderAdmin();

}


/* =========================================================
   START APPLICATION
   ========================================================= */

(async function boot() {

  await registry.load();

  renderAll();

})();