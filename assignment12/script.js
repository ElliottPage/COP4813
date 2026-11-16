"use strict";

const tableBody = document.getElementById("cms-table-body");
const statusMessage = document.getElementById("cms-status");

const informationColumns = [
    "Support",
    "Technology",
    "Capabilities",
    "Limitations"
];

const officialWebsites = {
    WordPress: "https://wordpress.org/",
    Drupal: "https://www.drupal.org/",
    Joomla: "https://www.joomla.org/",
    Ghost: "https://ghost.org/",
    Grav: "https://getgrav.org/"
};

function validateData(systems) {
    if (!Array.isArray(systems) || systems.length < 5) {
        throw new Error("The JSON must contain at least five CMS entries.");
    }

    for (const system of systems) {
        if (
            !system ||
            typeof system.Name !== "string" ||
            !Object.hasOwn(officialWebsites, system.Name)
        ) {
            throw new Error("A CMS name is missing or unsupported.");
        }

        for (const column of informationColumns) {
            const items = system[column];

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error(
                    `${system.Name} is missing its ${column} information.`
                );
            }

            for (const item of items) {
                if (
                    !item ||
                    typeof item.text !== "string" ||
                    item.text.trim() === ""
                ) {
                    throw new Error(
                        `${system.Name} has an invalid ${column} item.`
                    );
                }
            }
        }

        const example = system.Examples?.[0];

        if (
            !example ||
            typeof example.text !== "string" ||
            example.text.trim() === "" ||
            typeof example.url !== "string"
        ) {
            throw new Error(
                `${system.Name} is missing an example website.`
            );
        }

        const exampleUrl = new URL(example.url);

        if (!["https:", "http:"].includes(exampleUrl.protocol)) {
            throw new Error(
                "Example website links must use HTTP or HTTPS."
            );
        }
    }
}

function createNameCell(system) {
    const cell = document.createElement("th");
    const name = document.createElement("span");
    const link = document.createElement("a");

    cell.scope = "row";

    name.textContent = system.Name;

    link.href = officialWebsites[system.Name];
    link.textContent = "Official website";
    link.className = "cms-source";
    link.setAttribute(
        "aria-label",
        `${system.Name} official website`
    );

    cell.append(name, link);

    return cell;
}

function createInformationCell(items) {
    const cell = document.createElement("td");
    const list = document.createElement("ul");

    for (const item of items) {
        const listItem = document.createElement("li");

        listItem.textContent = item.text;
        list.appendChild(listItem);
    }

    cell.appendChild(list);

    return cell;
}

function createExampleCell(examples) {
    const cell = document.createElement("td");
    const link = document.createElement("a");
    const example = examples[0];

    link.href = example.url;
    link.textContent = example.text;

    cell.appendChild(link);

    return cell;
}

function renderTable(systems) {
    const fragment = document.createDocumentFragment();

    for (const system of systems) {
        const row = document.createElement("tr");

        row.appendChild(createNameCell(system));

        for (const column of informationColumns) {
            row.appendChild(
                createInformationCell(system[column])
            );
        }

        row.appendChild(createExampleCell(system.Examples));
        fragment.appendChild(row);
    }

    tableBody.replaceChildren(fragment);
}

async function loadCmsData() {
    statusMessage.hidden = true;

    try {
        const response = await fetch("cms.json");

        if (!response.ok) {
            throw new Error(
                `Unable to load cms.json. HTTP status: ${response.status}`
            );
        }

        const systems = await response.json();

        validateData(systems);
        renderTable(systems);
    } catch (error) {
        tableBody.replaceChildren();
        statusMessage.hidden = false;

        console.error("CMS comparison error:", error);
    }
}

loadCmsData();