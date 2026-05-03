import { ItemManager } from "@item";

const spawnerSettingsHeader = document.createElement("div");
spawnerSettingsHeader.classList.add("menu-group-header");
spawnerSettingsHeader.textContent = "Settings";

const spawnerSettingsContent = document.createElement("div");
spawnerSettingsContent.classList.add("menu-group-content");

// Start Spawned
const startSpawned = document.createElement("div");
startSpawned.classList.add("menu-item");

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.id = "startSpawned";
startSpawned.addEventListener("click", (e) => {
    if (e.target === checkbox) {
        return;
    }
    checkbox.checked = !checkbox.checked;
});
const startSpawnedLabel = document.createElement("span");
startSpawnedLabel.textContent = "Start Spawned";

startSpawned.appendChild(checkbox);
startSpawned.appendChild(startSpawnedLabel);
spawnerSettingsContent.appendChild(startSpawned);

// Time interval
const timeInterval = document.createElement("div");
timeInterval.classList.add("menu-item");

const input = document.createElement("input");
input.type = "number";
input.id = "timeBetweenSpawn";
input.value = "10";

input.addEventListener("input", () => {
    const value = Number(input.value);
    if (value > 100) {
        input.value = "100";
    }
    if (value < 0) {
        input.value = "0";
    }
});
timeInterval.addEventListener("click", (e) => {
    if (e.target === input) {
        return;
    }
    input.focus();
});

const intervalLabel = document.createElement("span");
intervalLabel.textContent = "Interval";

timeInterval.appendChild(input);
timeInterval.appendChild(intervalLabel);
spawnerSettingsContent.appendChild(timeInterval);

// Containing
const containing = document.createElement("div");
containing.classList.add("menu-item");

const textInput = document.createElement("input");
textInput.type = "text";
textInput.placeholder = "...enter item names";
textInput.id = "containing";

textInput.addEventListener("blur", () => {
    const values = getValidItemArray(textInput.value);
    textInput.value = values.join(", ");
});

containing.addEventListener("click", (e) => {
    if (e.target === textInput) {
        return;
    }
    textInput.focus();
});

function getValidItemArray(input: string): string[] {
    const valid = new Set(ItemManager.getRegisteredNames());
    return input.split(",").map(s => s.trim()).filter(s => s.length > 0).filter(s => valid.has(s));
}

const containingLabel = document.createElement("span");
containingLabel.textContent = "Contains";

containing.appendChild(textInput);
containing.appendChild(containingLabel);
spawnerSettingsContent.appendChild(containing);


export { spawnerSettingsContent, spawnerSettingsHeader, getValidItemArray };