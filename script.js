```javascript
/* =========================================================
   DOCUMENT SIGNATURE MONITORING SYSTEM

   WORKFLOW:

   SIGNATORIES:
   ☑ Person 1
   ☐ Person 2
   ☐ Person 3

   RECEIVED BY:
   Person 2

   When Person 2 is checked:

   SIGNATORIES:
   ☑ Person 1
   ☑ Person 2
   ☐ Person 3

   RECEIVED BY:
   Person 3

   When everyone is checked:

   REMARK:
   COMPLETED

   RECEIVED BY:
   COMPLETED
   ========================================================= */


/* ================= DATA ================= */

let documents =
    JSON.parse(
        localStorage.getItem(
            "documentMonitoring"
        )
    ) || [];


let editingId = null;



/* ================= SAVE ================= */

function saveData() {

    localStorage.setItem(

        "documentMonitoring",

        JSON.stringify(documents)

    );

}



/* ================= OPEN ADD ================= */

function openAddModal() {

    editingId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "Add Document";


    document.getElementById(
        "documentForm"
    ).reset();


    document.getElementById(
        "signatoriesContainer"
    ).innerHTML = "";


    addSignatoryField();


    document.getElementById(
        "documentDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "documentModal"
    ).style.display = "flex";

}



/* ================= CLOSE ================= */

function closeModal() {

    document.getElementById(
        "documentModal"
    ).style.display = "none";

}



/* ================= ADD SIGNATORY ================= */

function addSignatoryField(
    name = "",
    dateTime = "",
    checked = false
) {

    const container =
        document.getElementById(
            "signatoriesContainer"
        );


    const div =
        document.createElement("div");


    div.className =
        "form-person";


    div.innerHTML = `

        <input
            type="text"
            class="signatory-name"
            placeholder="Signatory name"
            value="${escapeHTML(name)}"
            required
        >

        <input
            type="datetime-local"
            class="signatory-time"
            value="${dateTime}"
        >

        <button
            type="button"
            class="remove-person"
            onclick="
                this.parentElement.remove()
            "
        >
            ×
        </button>

    `;


    container.appendChild(div);

}



/* ================= FORM SUBMIT ================= */

document
    .getElementById("documentForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const date =
                document.getElementById(
                    "documentDate"
                ).value;


            const documentName =
                document.getElementById(
                    "documentName"
                ).value.trim();


            const trustedBy =
                document.getElementById(
                    "trustedBy"
                ).value.trim();



            /* ================= SIGNATORIES ================= */

            const rows =
                document.querySelectorAll(
                    "#signatoriesContainer .form-person"
                );


            let signatories = [];


            rows.forEach(row => {

                const name =
                    row.querySelector(
                        ".signatory-name"
                    ).value.trim();


                const dateTime =
                    row.querySelector(
                        ".signatory-time"
                    ).value;


                if (name !== "") {

                    signatories.push({

                        name: name,

                        dateTime: dateTime,

                        signed: false

                    });

                }

            });



            if (
                signatories.length === 0
            ) {

                alert(
                    "Please add at least one signatory."
                );

                return;

            }



            /* ================= DOCUMENT ================= */

            const documentData = {

                id:
                    editingId !== null
                        ? editingId
                        : Date.now(),

                date: date,

                documentName:
                    documentName,

                trustedBy:
                    trustedBy,

                signatories:
                    signatories

            };



            /* ================= EDIT ================= */

            if (
                editingId !== null
            ) {

                const index =
                    documents.findIndex(
                        doc =>
                            doc.id ===
                            editingId
                    );


                if (index !== -1) {

                    /*
                       IMPORTANT:

                       Keep existing checkbox
                       status when editing.
                    */

                    const oldDocument =
                        documents[index];


                    documentData.signatories =
                        signatories.map(
                            (person, i) => {

                                return {

                                    name:
                                        person.name,

                                    dateTime:
                                        person.dateTime,

                                    signed:
                                        oldDocument
                                            .signatories[i]
                                            ? oldDocument
                                                .signatories[i]
                                                .signed
                                            : false

                                };

                            }
                        );


                    documents[index] =
                        documentData;

                }

            }

            else {

                documents.push(
                    documentData
                );

            }



            saveData();

            displayDocuments();

            closeModal();

        }
    );



/* =========================================================
   DISPLAY DOCUMENTS
   ========================================================= */

function displayDocuments() {

    const tableBody =
        document.getElementById(
            "documentTableBody"
        );


    const search =
        document.getElementById(
            "searchInput"
        ).value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filtered =
        documents.filter(
            doc =>
                doc.documentName
                    .toLowerCase()
                    .includes(search)
        );


    document.getElementById(
        "emptyMessage"
    ).style.display =
        filtered.length === 0
            ? "block"
            : "none";



    filtered.forEach(doc => {

        const row =
            document.createElement(
                "tr"
            );



        /* ================= CHECK COMPLETED ================= */

        const allSigned =
            doc.signatories.length > 0 &&
            doc.signatories.every(
                person =>
                    person.signed === true
            );



        /* ================= CURRENT RECEIVER ================= */

        let currentReceiver = null;


        if (!allSigned) {

            currentReceiver =
                doc.signatories.find(
                    person =>
                        person.signed === false
                );

        }



        /* ================= REMARK ================= */

        const remark =
            allSigned
                ? "Completed"
                : "Pending";


        const remarkClass =
            allSigned
                ? "completed"
                : "pending";



        /* ================= SIGNATORIES ================= */

        let signatoriesHTML = `

            <div class="people-header">

                <span></span>

                <span>NAME</span>

                <span>DATE & TIME</span>

            </div>

        `;


        doc.signatories.forEach(
            (person, index) => {

                signatoriesHTML += `

                    <div class="person-row">

                        <input
                            type="checkbox"
                            ${
                                person.signed
                                    ? "checked"
                                    : ""
                            }

                            onchange="
                                toggleSignatory(
                                    ${doc.id},
                                    ${index}
                                )
                            "
                        >


                        <span
                            class="person-name"
                        >

                            ${escapeHTML(
                                person.name
                            )}

                        </span>


                        <span
                            class="person-time"
                        >

                            ${
                                person.signed
                                    ? formatDateTime(
                                        person.dateTime
                                      )
                                    : "____________"
                            }

                        </span>

                    </div>

                `;

            }
        );



        /* ================= RECEIVED BY ================= */

        let receivedHTML = "";


        if (allSigned) {

            receivedHTML = `

                <div class="received-current">

                    <div class="received-label">
                        STATUS
                    </div>

                    <div class="received-name">
                        COMPLETED
                    </div>

                </div>

            `;

        }

        else {

            receivedHTML = `

                <div class="received-current">

                    <div class="received-label">
                        CURRENT RECEIVER
                    </div>

                    <div class="received-name">

                        ${escapeHTML(
                            currentReceiver.name
                        )}

                    </div>

                    <div class="received-time">

                        ${
                            currentReceiver.dateTime
                                ? formatDateTime(
                                    currentReceiver.dateTime
                                  )
                                : "Date & Time not recorded"
                        }

                    </div>

                </div>

            `;

        }



        /* ================= TABLE ROW ================= */

        row.innerHTML = `

            <td>

                ${formatDate(
                    doc.date
                )}

            </td>


            <td>

                <strong>

                    ${escapeHTML(
                        doc.documentName
                    )}

                </strong>

            </td>


            <td>

                ${escapeHTML(
                    doc.trustedBy
                )}

            </td>


            <td>

                ${signatoriesHTML}

            </td>


            <td>

                ${receivedHTML}

            </td>


            <td>

                <span
                    class="
                        remark
                        ${remarkClass}
                    "
                >

                    ${remark}

                </span>

            </td>


            <td>

                <div
                    class="action-buttons"
                >

                    <button
                        class="edit-btn"
                        onclick="
                            editDocument(
                                ${doc.id}
                            )
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="
                            deleteDocument(
                                ${doc.id}
                            )
                        "
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateDashboard();

}



/* =========================================================
   CHECK / UNCHECK SIGNATORY
   ========================================================= */

function toggleSignatory(
    documentId,
    signatoryIndex
) {

    const doc =
        documents.find(
            document =>
                document.id ===
                documentId
        );


    if (!doc) {

        return;

    }


    const person =
        doc.signatories[
            signatoryIndex
        ];


    if (!person) {

        return;

    }



    /*
       The checkbox controls
       the signature status.
    */

    person.signed =
        !person.signed;



    /*
       When checked, record the
       current date/time if no
       date/time was entered.
    */

    if (
        person.signed &&
        !person.dateTime
    ) {

        person.dateTime =
            getCurrentDateTime();

    }


    /*
       If unchecked again,
       clear the recorded date/time.
    */

    if (!person.signed) {

        person.dateTime = "";

    }



    saveData();

    displayDocuments();

}



/* =========================================================
   EDIT DOCUMENT
   ========================================================= */

function editDocument(id) {

    const doc =
        documents.find(
            document =>
                document.id === id
        );


    if (!doc) {

        return;

    }


    editingId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Document";


    document.getElementById(
        "documentDate"
    ).value =
        doc.date;


    document.getElementById(
        "documentName"
    ).value =
        doc.documentName;


    document.getElementById(
        "trustedBy"
    ).value =
        doc.trustedBy;



    document.getElementById(
        "signatoriesContainer"
    ).innerHTML = "";


    doc.signatories.forEach(
        person => {

            addSignatoryField(
                person.name,
                person.dateTime,
                person.signed
            );

        }
    );


    document.getElementById(
        "documentModal"
    ).style.display =
        "flex";

}



/* =========================================================
   DELETE DOCUMENT
   ========================================================= */

function deleteDocument(id) {

    const answer =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!answer) {

        return;

    }


    documents =
        documents.filter(
            doc =>
                doc.id !== id
        );


    saveData();

    displayDocuments();

}



/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        documents.length;


    const completed =
        documents.filter(
            doc =>
                doc.signatories.length > 0 &&
                doc.signatories.every(
                    person =>
                        person.signed === true
                )
        ).length;


    const pending =
        total - completed;


    document.getElementById(
        "totalDocuments"
    ).textContent =
        total;


    document.getElementById(
        "completedDocuments"
    ).textContent =
        completed;


    document.getElementById(
        "pendingDocuments"
    ).textContent =
        pending;

}



/* =========================================================
   CURRENT DATE / TIME
   ========================================================= */

function getCurrentDateTime() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    return (
        `${year}-${month}-${day}` +
        `T${hours}:${minutes}`
    );

}



/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(date) {

    if (!date) {

        return "";

    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        parts[1] +
        "/" +
        parts[2] +
        "/" +
        parts[0]
    );

}



/* =========================================================
   FORMAT DATE / TIME
   ========================================================= */

function formatDateTime(dateTime) {

    if (!dateTime) {

        return "____________";

    }


    const date =
        new Date(dateTime);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateTime;

    }


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ========================================================= */

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "documentModal"
            );


        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);



/* =========================================================
   INITIAL LOAD
   ========================================================= */

displayDocuments();
```
