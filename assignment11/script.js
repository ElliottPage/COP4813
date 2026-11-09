"use strict";

const state = {
    data: null,
    completed: new Set(),
    planned: new Set(),
    term: "Fall"
};

const completedList = document.getElementById("completed-list");
const courseList = document.getElementById("course-list");
const planList = document.getElementById("plan-list");
const planSummary = document.getElementById("plan-summary");
const statusMessage = document.getElementById("advisor-status");
const termSelect = document.getElementById("term-select");
const resetButton = document.getElementById("reset-button");
const dropzone = document.getElementById("plan-dropzone");

function announce(message) {
    statusMessage.textContent = message;
}

function getCourse(id) {
    return state.data.courses.find(course => course.id === id);
}

/*
 * A string represents one completed course.
 * "all" represents AND.
 * "any" represents OR.
 */
function meetsRequirement(rule) {
    if (!rule) {
        return true;
    }

    if (typeof rule === "string") {
        return state.completed.has(rule);
    }

    if (Array.isArray(rule.all)) {
        return rule.all.every(meetsRequirement);
    }

    if (Array.isArray(rule.any)) {
        return rule.any.some(meetsRequirement);
    }

    return false;
}

function describeRequirement(rule) {
    if (!rule) {
        return "None";
    }

    if (typeof rule === "string") {
        return rule;
    }

    if (Array.isArray(rule.all)) {
        return (
            "(" +
            rule.all.map(describeRequirement).join(" AND ") +
            ")"
        );
    }

    if (Array.isArray(rule.any)) {
        return (
            "(" +
            rule.any.map(describeRequirement).join(" OR ") +
            ")"
        );
    }

    return "Unrecognized requirement";
}

/*
 * Planning-choice restrictions are separate from OR prerequisites.
 * Completed-course history is never disabled by this function.
 */
function getPlanningAlternative(course) {
    if (!course.planChoiceGroup) {
        return null;
    }

    return state.data.courses.find(other =>
        other.id !== course.id &&
        other.planChoiceGroup === course.planChoiceGroup &&
        (
            state.completed.has(other.id) ||
            state.planned.has(other.id)
        )
    );
}

function eligibility(course) {
    if (state.completed.has(course.id)) {
        return {
            allowed: false,
            message: "Already completed."
        };
    }

    const alternative = getPlanningAlternative(course);

    if (alternative) {
        return {
            allowed: false,
            message:
                `${alternative.id} already fills this planning choice. ` +
                "Both courses are not needed for this requirement."
        };
    }

    if (!meetsRequirement(course.prerequisites)) {
        return {
            allowed: false,
            message:
                "Locked: complete " +
                describeRequirement(course.prerequisites) +
                "."
        };
    }

    if (
        course.offered &&
        !course.offered.includes(state.term)
    ) {
        return {
            allowed: false,
            message:
                "Prerequisites met, but the catalog offering pattern is " +
                course.offered.join(", ") +
                ", not " +
                state.term +
                "."
        };
    }

    return {
        allowed: true,
        message: "Prerequisites met - eligible to add to your plan."
    };
}

function paragraph(text, className = "") {
    const element = document.createElement("p");

    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function button(text, handler, disabled = false) {
    const element = document.createElement("button");

    element.type = "button";
    element.className = "secondary-button";
    element.textContent = text;
    element.disabled = disabled;

    element.addEventListener("click", handler);

    return element;
}

function createCard(course) {
    const card = document.createElement("article");
    card.className = "course-card";

    const heading = document.createElement("h3");
    heading.textContent = `${course.id} - ${course.title}`;

    card.append(heading);

    if (Number.isFinite(course.credits)) {
        card.append(paragraph(`${course.credits} credits`));
    }

    return card;
}

function addDetails(card, course, location) {
    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.textContent = "Course Details";

    details.append(
        summary,
        paragraph(course.notes)
    );

    if (course.selectionGroup) {
        const group = state.data.selectionGroups.find(
            item => item.id === course.selectionGroup
        );

        if (group) {
            details.append(paragraph(group.note));
        }
    }

    if (course.catalogUrl) {
        const link = document.createElement("a");

        link.href = course.catalogUrl;
        link.textContent = "View catalog course description";

        details.append(link);
    }

    const noteId = `note-${location}-${course.id}`;

    const label = document.createElement("label");
    label.htmlFor = noteId;
    label.textContent = "My advising note";

    const textarea = document.createElement("textarea");

    textarea.id = noteId;
    textarea.value = course.studentNote || "";
    textarea.dataset.noteCourse = course.id;

    textarea.addEventListener("input", () => {
        course.studentNote = textarea.value;

        document.querySelectorAll("[data-note-course]").forEach(other => {
            if (
                other !== textarea &&
                other.dataset.noteCourse === course.id
            ) {
                other.value = course.studentNote;
            }
        });
    });

    textarea.addEventListener("change", () => {
        announce(
            `Note updated for ${course.id}. ` +
            "Notes last until page reload."
        );
    });

    const noteContainer = document.createElement("p");

    noteContainer.append(label, textarea);
    details.append(noteContainer);

    card.append(details);
}

function addCompletionControl(card, course) {
    const label = document.createElement("label");
    label.className = "completion-label";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = state.completed.has(course.id);

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            state.completed.add(course.id);
        } else {
            state.completed.delete(course.id);
        }

        refresh(`${course.id} completion updated.`);
    });

    label.append(
        checkbox,
        document.createTextNode("Completed with C or better")
    );

    card.append(label);
}

function renderTranscript() {
    completedList.replaceChildren();

    state.data.courses.forEach(course => {
        const card = createCard(course);

        addCompletionControl(card, course);
        addDetails(card, course, "transcript");

        completedList.append(card);
    });
}

function renderOptions() {
    courseList.replaceChildren();

    const unfinishedCourses = state.data.courses.filter(course =>
        course.role === "planning" &&
        !state.completed.has(course.id)
    );

    if (unfinishedCourses.length === 0) {
        courseList.append(
            paragraph(
                "All planning courses in this prototype are recorded " +
                "as completed."
            )
        );

        return;
    }

    const eligibleCourses = unfinishedCourses.filter(
        course => eligibility(course).allowed
    );

    unfinishedCourses.forEach(course => {
        const card = createCard(course);
        const result = eligibility(course);

        card.append(
            paragraph(
                "Prerequisites: " +
                describeRequirement(course.prerequisites)
            )
        );

        card.append(
            paragraph(
                result.message,
                "course-status " +
                (result.allowed ? "is-ready" : "is-locked")
            )
        );

        const actions = document.createElement("div");
        actions.className = "course-actions";

        const alreadyPlanned = state.planned.has(course.id);

        actions.append(
            button(
                alreadyPlanned ? "Already in Plan" : "Add to Plan",
                () => addToPlan(course.id),
                !result.allowed || alreadyPlanned
            )
        );

        card.append(actions);

        card.draggable = result.allowed && !alreadyPlanned;

        card.addEventListener("dragstart", event => {
            if (!card.draggable || !event.dataTransfer) {
                event.preventDefault();
                return;
            }

            event.dataTransfer.setData(
                "text/plain",
                course.id
            );

            event.dataTransfer.effectAllowed = "copy";
        });

        addDetails(card, course, "options");

        courseList.append(card);
    });
}

function renderPlan() {
    planList.replaceChildren();

    let credits = 0;

    state.planned.forEach(id => {
        const course = getCourse(id);
        const card = createCard(course);

        credits += course.credits;

        card.append(
            button(
                "Remove from Plan",
                () => {
                    state.planned.delete(id);

                    refresh(
                        `${id} removed from your plan.`
                    );
                }
            )
        );

        addDetails(card, course, "plan");

        planList.append(card);
    });

    planSummary.textContent =
        `${state.term} plan: ` +
        `${state.planned.size} course(s), ` +
        `${credits} credits.`;
}

function refresh(message) {
    const removed = [];

    state.planned.forEach(id => {
        const course = getCourse(id);

        if (!course || !eligibility(course).allowed) {
            state.planned.delete(id);
            removed.push(id);
        }
    });

    renderTranscript();
    renderOptions();
    renderPlan();

    if (removed.length > 0) {
        message +=
            " Removed from the plan because eligibility changed: " +
            removed.join(", ") +
            ".";
    }

    announce(message);
}

function addToPlan(id) {
    if (!state.data) {
        announce("Course data is still loading.");
        return;
    }

    const course = getCourse(id);

    if (!course || course.role !== "planning") {
        announce(
            "Drop a planning course from the Course Options section."
        );

        return;
    }

    if (state.planned.has(id)) {
        announce(`${id} is already in your plan.`);
        return;
    }

    const result = eligibility(course);

    if (!result.allowed) {
        announce(result.message);
        return;
    }

    state.planned.add(id);

    refresh(
        `${id} added to your ${state.term} plan.`
    );
}

termSelect.addEventListener("change", () => {
    state.term = termSelect.value;

    if (state.data) {
        refresh(
            `Planning term changed to ${state.term}.`
        );
    }
});

resetButton.addEventListener("click", () => {
    if (!state.data) {
        return;
    }

    const confirmed = window.confirm(
        "Clear completed courses, planned courses, and personal notes?"
    );

    if (!confirmed) {
        return;
    }

    state.completed.clear();
    state.planned.clear();

    state.term = "Fall";
    termSelect.value = state.term;

    state.data.courses.forEach(course => {
        course.studentNote = "";
    });

    refresh("Advisor reset.");
});

dropzone.addEventListener("dragover", event => {
    event.preventDefault();

    dropzone.classList.add("is-over");

    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
    }
});

dropzone.addEventListener("dragleave", event => {
    if (!dropzone.contains(event.relatedTarget)) {
        dropzone.classList.remove("is-over");
    }
});

dropzone.addEventListener("drop", event => {
    event.preventDefault();

    dropzone.classList.remove("is-over");

    if (!state.data || !event.dataTransfer) {
        return;
    }

    const id = event.dataTransfer.getData("text/plain");

    addToPlan(id);
});

document.addEventListener("dragend", () => {
    dropzone.classList.remove("is-over");
});

async function initialize() {
    termSelect.disabled = true;
    resetButton.disabled = true;

    try {
        const response = await fetch("courses.json");

        if (!response.ok) {
            throw new Error(
                `Course data request failed: ${response.status}`
            );
        }

        state.data = await response.json();

        const program = state.data.program;

        document.getElementById(
            "program-description"
        ).textContent =
            `${program.name}. ` +
            `Catalog: ${program.catalog}. ` +
            `${program.scope}.`;

        const link = document.getElementById("program-link");

        link.href = program.url;
        link.hidden = false;

        state.term = termSelect.value;

        refresh(
            "Ready. Select your completed courses."
        );

        termSelect.disabled = false;
        resetButton.disabled = false;
    } catch (error) {
        console.error(error);

        announce(
            "Unable to load course data. Check that courses.json is " +
            "in the assignment11 folder and open the site through " +
            "a local web server or GitHub Pages."
        );
    }
}

initialize();