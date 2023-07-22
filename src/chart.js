// Global variable for chart configuration
// 2019,2;2020,3;2021,5;2022,4
const defaultData = [
    [2019, 2], 
    [2020, 3], 
    [2021, 5], 
    [2022, 4],
];


let config;
let data = defaultData; 

// Helper function to get canvas context
function getCanvasContext() {
    return document.getElementById("chartCanvas").getContext("2d");
}

// Helper function to clear the canvas
function clearCanvas() {
    const ctx = getCanvasContext();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Helper function to parse raw data 
function parseData(inputData) {
    const data = [];
    console.log(inputData);
    const entries = inputData.split(';');
    for (const entry of entries) {
        console.log(entry);
        const [year, value] = entry.split(',');
        console.log(year + " - " + value);
        data.push([parseInt(year),parseInt(value)]);
    }
    return data;
}


// Helper function to get chart config from the UI inputs
function getChartConfig() {
    // Get values from UI inputs
    const barColor = document.getElementById("barColor").value;
    const lineColor = document.getElementById("lineColor").value;
    const lineStyle = document.getElementById("lineStyle").value;
    const lineWidth = parseInt(document.getElementById("lineWidth").value);
    const pointShape = document.getElementById("pointShape").value;
    const pointColor = document.getElementById("pointColor").value;
    const pointSize = parseInt(document.getElementById("pointSize").value);
    const fontFamily = document.getElementById("fontFamily").value;
    const fontSize = parseInt(document.getElementById("fontSize").value);
    const fontColor = document.getElementById("fontColor").value;

    // TO DO： 增加获取二元数据数组、填充样式、渐变控制，并添加到return内容中




    return {
        bar: {
            color: barColor,
        },
        line: {
            color: lineColor,
            style: lineStyle,
            width: lineWidth,
            point: {
                shape: pointShape,
                color: pointColor,
                size: pointSize,
            },
        },
        font: {
            family: fontFamily,
            size: fontSize,
            color: fontColor,
        },
    };
}

// 1. Function to draw the interactive chart based on input data
function drawInteractiveChart(data) {
    clearCanvas();
    const ctx = getCanvasContext();
    const chartType = document.getElementById("chartType").value; // Get chart type directly here
    config = getChartConfig();

    const barWidth = 40; // Width of each bar in the bar chart
    const barSpacing = 20; // Spacing between bars in the bar chart
    const axisOffset = 20; // Offset for axis labels
    const arrowSize = 5; // Size of the arrow

    // Find the maximum production value to calculate the scale
    const maxProduction = Math.max(...data.map((entry) => entry[1]));

    // Calculate the scale for the bar chart based on the canvas height and the maximum production value
    const scale = (ctx.canvas.height - axisOffset * 3) / maxProduction; // Increase offset for labels

    // Draw the x-axis
    ctx.beginPath();
    ctx.moveTo(axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset - arrowSize, ctx.canvas.height - axisOffset + arrowSize);
    ctx.moveTo(ctx.canvas.width - axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset - arrowSize, ctx.canvas.height - axisOffset - arrowSize);
    ctx.stroke();

    // Draw the y-axis
    ctx.beginPath();
    ctx.moveTo(axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(axisOffset, axisOffset);
    ctx.lineTo(axisOffset - arrowSize, axisOffset + arrowSize);
    ctx.moveTo(axisOffset, axisOffset);
    ctx.lineTo(axisOffset + arrowSize, axisOffset + arrowSize);
    ctx.stroke();

    // Draw x-axis label
    ctx.fillStyle = config.font.color;
    ctx.font = `${config.font.size}px ${config.font.family}`;
    ctx.textAlign = "center";
    ctx.fillText("年份", ctx.canvas.width - axisOffset / 2, ctx.canvas.height - axisOffset / 2);

    // Draw y-axis label
    ctx.save();
    ctx.translate(axisOffset / 2, axisOffset / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("产量（万吨）", 0, 0);
    ctx.restore();

    // Draw x-axis tick marks and labels
    data.forEach((entry, index) => {
        const year = entry[0];
        const x = axisOffset + index * (barWidth + barSpacing);
        const y = ctx.canvas.height - axisOffset;

        // Draw the tick mark
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 5);
        ctx.stroke();

        // Draw the year label
        ctx.fillText(year.toString(), x, y + 15);
    });

    // Draw y-axis tick marks and labels
    const numTicks = 6; // Number of tick marks on the y-axis
    const tickStep = maxProduction / numTicks;
    for (let i = 0; i <= numTicks; i++) {
        const production = i * tickStep;
        const x = axisOffset;
        const y = ctx.canvas.height - axisOffset - production * scale;

        // Draw the tick mark
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y);
        ctx.stroke();

        // Draw the production label
        ctx.fillText(production.toFixed(0), x - 10, y);
    }

    // Draw the bar chart and display production
    if (chartType === "bar" || chartType === "all") {
        data.forEach((entry, index) => {
            const year = entry[0];
            const production = entry[1];
            const x = axisOffset + index * (barWidth + barSpacing);
            const y = ctx.canvas.height - axisOffset - production * scale;

            // Draw the bar
            ctx.fillStyle = config.bar.color;
            ctx.fillRect(x, y, barWidth, production * scale);

            // Display production above the bar
            ctx.fillText(production.toString(), x + barWidth / 2, y - 5);
        });
    }

    // Draw the line chart and percentage labels
    if (chartType === "line" || chartType === "all") {
        drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing);
        drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing);
    }
}



// 2. Function to draw the line and data points for the line chart
function drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing) {
    const ctx = getCanvasContext();
    const config = getChartConfig();

    // Calculate the line chart points with the adjusted scaling
    const points = data.map((entry, index) => {
        const year = entry[0];
        const production = entry[1];
        const x = axisOffset + index * (barWidth + barSpacing);
        const y = ctx.canvas.height - axisOffset - production * scale;

        // Draw the line chart data point
        ctx.fillStyle = config.line.point.color;
        if (config.line.point.shape === "circle") {
            ctx.beginPath();
            ctx.arc(x, y, config.line.point.size, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillRect(x - config.line.point.size / 2, y - config.line.point.size / 2, config.line.point.size, config.line.point.size);
        }

        return [x, y];
    });

    // Draw the line
    ctx.strokeStyle = config.line.color;
    ctx.lineWidth = config.line.width;
    ctx.beginPath();
    points.forEach((point, index) => {
        const [x, y] = point;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
}

// 3. Function to draw the percentage labels for the line chart
function drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing) {
    const ctx = getCanvasContext();
    const config = getChartConfig();

    // Find the maximum production value to calculate the scale
    const maxProduction = Math.max(...data.map((entry) => entry[1]));
    const totalProduction = data.reduce((sum, entry) => sum + entry[1], 0);

    // Calculate the percentage labels and draw them
    data.forEach((entry, index) => {
        const year = entry[0];
        const production = entry[1];
        const x = axisOffset + index * (barWidth + barSpacing);
        const y = ctx.canvas.height - axisOffset - production * scale;

        // Draw the percentage label above the data point
        const percentage = ((production / totalProduction) * 100).toFixed(2) + "%";
        const dataPointOffset = 10; // Distance between the data point and the top of the bar

        ctx.fillStyle = config.font.color;
        ctx.font = `${config.font.size}px ${config.font.family}`;
        ctx.textAlign = "center";
        ctx.fillText(percentage, x, y - dataPointOffset);
    });
}

// 5. Function to handle the change event of the chart type dropdown and redraw the chart accordingly
function handleChartTypeChange() {
    drawInteractiveChart(data);
}

// 6. Function to handle the change event of the data and redraw the chart on default data. 
function handleDataChangeDefault() { 
    drawInteractiveChart(defaultData); 
}


function handleDataChangeInput() {

    const rawData = document.getElementById("dataInput").value;
    data = parseData(rawData);
    drawInteractiveChart(data); 
}
// Example data for the chart (year and production in million tons)


// Initial chart setup and rendering
config = getChartConfig();
drawInteractiveChart(data);

// Event listeners for UI inputs
document.getElementById("chartType").addEventListener("change", handleChartTypeChange);
document.getElementById("barColor").addEventListener("change", handleChartTypeChange);
document.getElementById("lineColor").addEventListener("change", handleChartTypeChange);
document.getElementById("lineStyle").addEventListener("change", handleChartTypeChange);
document.getElementById("lineWidth").addEventListener("change", handleChartTypeChange);
document.getElementById("pointShape").addEventListener("change", handleChartTypeChange);
document.getElementById("pointColor").addEventListener("change", handleChartTypeChange);
document.getElementById("pointSize").addEventListener("change", handleChartTypeChange);
document.getElementById("fontFamily").addEventListener("input", handleChartTypeChange);
document.getElementById("fontSize").addEventListener("change", handleChartTypeChange);
document.getElementById("fontColor").addEventListener("change", handleChartTypeChange);
document.getElementById("default").addEventListener("click",handleDataChangeDefault);
document.getElementById("dataInputCheck").addEventListener("click", handleDataChangeInput); 