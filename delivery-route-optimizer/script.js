let locations = [
    { name: "Warehouse", x: 100, y: 200 },
    { name: "A", x: 300, y: 100 },
    { name: "B", x: 500, y: 250 },
    { name: "C", x: 250, y: 350 }
];
function displayLocations() {

    const container = document.getElementById("locations");

    container.innerHTML = "";

    locations.forEach((location, index) => {

        container.innerHTML += `
            <div class="location">

                <input
                    type="text"
                    value="${location.name}"
                    onchange="updateName(${index}, this.value)"
                >

                <input
                    type="number"
                    value="${location.x}"
                    onchange="updateX(${index}, this.value)"
                >

                <input
                    type="number"
                    value="${location.y}"
                    onchange="updateY(${index}, this.value)"
                >

            </div>
        `;
    });
}
function updateName(index, value) {
    locations[index].name = value;
}
function updateX(index, value) {
    locations[index].x = Number(value);
}
function updateY(index, value) {
    locations[index].y = Number(value);
}
function addLocation() {

    const newName = "Location " + locations.length;

    locations.push({
        name: newName,
        x: Math.floor(Math.random() * 600) + 50,
        y: Math.floor(Math.random() * 300) + 50
    });

    displayLocations();
    displayDistanceMatrix();
    drawRoute([]);
}

function calculateDistance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}
function displayDistanceMatrix() {

    const container =
        document.getElementById("distanceMatrix");

    let table = "<table>";

    // Header row
    table += "<tr>";

    table += "<th>From / To</th>";

    locations.forEach(location => {

        table += `<th>${location.name}</th>`;

    });

    table += "</tr>";


    // Distance rows
    locations.forEach((from, i) => {

        table += "<tr>";

        table += `<th>${from.name}</th>`;

        locations.forEach((to, j) => {

            let distance;

            if (i === j) {

                distance = 0;

            } else {

                distance =
                    calculateDistance(from, to);

            }

            table +=
                `<td>${distance.toFixed(2)}</td>`;

        });

        table += "</tr>";

    });


    table += "</table>";

    container.innerHTML = table;
}

function tsp() {

    const n = locations.length;

    const memo = new Map();

    function solve(current, visited) {

        const key = current + "-" + visited;

        if (memo.has(key)) {
            return memo.get(key);
        }

        // All locations are visited
        if (visited === (1 << n) - 1) {

            return {
                cost: calculateDistance(
                    locations[current],
                    locations[0]
                ),

                path: [current, 0]
            };
        }

        let best = {
            cost: Infinity,
            path: []
        };

        for (let next = 0; next < n; next++) {

            // Check whether next location is already visited
            if ((visited & (1 << next)) === 0) {

                const result = solve(
                    next,
                    visited | (1 << next)
                );

                const distance = calculateDistance(
                    locations[current],
                    locations[next]
                );

                const totalCost =
                    distance + result.cost;

                if (totalCost < best.cost) {

                    best = {
                        cost: totalCost,
                        path: [current, ...result.path]
                    };
                }
            }
        }

        memo.set(key, best);

        return best;
    }

    return solve(0, 1);
}
function bruteForceTSP() {

    const n = locations.length;

    let bestCost = Infinity;
    let bestPath = [];

    function permute(path, visited) {

        if (path.length === n) {

            const fullPath = [...path, 0];

            let totalDistance = 0;

            for (let i = 0; i < fullPath.length - 1; i++) {

                totalDistance += calculateDistance(
                    locations[fullPath[i]],
                    locations[fullPath[i + 1]]
                );
            }

            if (totalDistance < bestCost) {

                bestCost = totalDistance;
                bestPath = fullPath;
            }

            return;
        }

        for (let i = 1; i < n; i++) {

            if (!visited.has(i)) {

                visited.add(i);
                path.push(i);

                permute(path, visited);

                path.pop();
                visited.delete(i);
            }
        }
    }

    permute([0], new Set([0]));

    return {
        cost: bestCost,
        path: bestPath
    };
}
function findOptimalRoute() {

    const startTime = performance.now();

    const result = tsp();

    const endTime = performance.now();

    const routeNames = result.path.map(
        index => locations[index].name
    );

    document.getElementById("route").innerHTML =
        "Route: " + routeNames.join(" → ");

    document.getElementById("distance").innerHTML =
        "Total Distance: " + result.cost.toFixed(2) + " units";

    document.getElementById("time").innerHTML =
        "Execution Time: " +
        (endTime - startTime).toFixed(4) + " ms";
    drawRoute(result.path);
}

function drawRoute(path) {

    const canvas = document.getElementById("routeCanvas");

    const ctx = canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 450;

    // Clear old route
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If there is no route, stop
    if (path.length === 0) {
        return;
    }

    // Draw route lines
    ctx.beginPath();

    path.forEach((index, i) => {

        const location = locations[index];

        if (i === 0) {

            ctx.moveTo(
                location.x,
                location.y
            );

        } else {

            ctx.lineTo(
                location.x,
                location.y
            );
        }
    });

    ctx.stroke();


    // Draw location points
    locations.forEach((location, index) => {

        ctx.beginPath();

        ctx.arc(
            location.x,
            location.y,
            14,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Location name
        ctx.font = "14px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            location.name,
            location.x,
            location.y - 22
        );

    });
}
function compareAlgorithms() {

    const bruteStart = performance.now();

    const bruteResult = bruteForceTSP();

    const bruteEnd = performance.now();


    const dpStart = performance.now();

    const dpResult = tsp();

    const dpEnd = performance.now();


    document.getElementById("bruteDistance").innerHTML =
        "Distance: " + bruteResult.cost.toFixed(2) + " units";

    document.getElementById("bruteTime").innerHTML =
        "Execution Time: " +
        (bruteEnd - bruteStart).toFixed(4) + " ms";


    document.getElementById("dpDistance").innerHTML =
        "Distance: " + dpResult.cost.toFixed(2) + " units";

    document.getElementById("dpTime").innerHTML =
        "Execution Time: " +
        (dpEnd - dpStart).toFixed(4) + " ms";
}
function resetProject() {

    // Restore default locations
    locations = [
        { name: "Warehouse", x: 100, y: 200 },
        { name: "A", x: 300, y: 100 },
        { name: "B", x: 500, y: 250 },
        { name: "C", x: 250, y: 350 }
    ];

    // Clear route result
    document.getElementById("route").innerHTML =
        "No route calculated yet.";

    document.getElementById("distance").innerHTML = "";

    document.getElementById("time").innerHTML = "";

    // Refresh locations
    displayLocations();

    // Refresh distance matrix
    displayDistanceMatrix();

    // Clear visualization
    drawRoute([]);
}
displayLocations();
displayDistanceMatrix();