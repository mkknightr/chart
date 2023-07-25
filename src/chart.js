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
        const [year, value] = entry.split(',');
        data.push([parseInt(year), parseInt(value)]);
    }
    data.sort((a, b) => a[0] - b[0]);
    return data;
}


// Helper function to get chart config from the UI inputs
function getChartConfig() {
    // Get values from UI inputs
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
    //填充样式选择
    const fillStyle = document.getElementById("fillStyle").value;
    //纯色填充
    const barColor = document.getElementById("barColor").value;
    //渐变颜色
    const startColor = document.getElementById('startColor').value;
    const endColor = document.getElementById('endColor').value;
    //渐变样式
    const gradientStyle = document.getElementById('gradientStyle').value;




    return {
        bar: {
            fillStyle: fillStyle,
            color: barColor,
            startColor: startColor,
            endColor: endColor,
            gradientStyle: gradientStyle,
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
function drawInteractiveChart(rawData) {
    //the var data is the raw data
    let data = JSON.parse(JSON.stringify(rawData));

    dataFilter(data);

    clearCanvas();
    const ctx = getCanvasContext();
    const chartType = document.getElementById("chartType").value; // Get chart type directly here
    config = getChartConfig();


    const axisOffset = 50; // Offset for axis labels
    const arrowSize = 10; // Size of the arrow

    console.log(data.length);
    const barWidth = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 1.5)); // Width of each bar in the bar chart
    console.log(barWidth);
    const barSpacing = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 3)); // Spacing between bars in the bar chart
    console.log(barSpacing);

    // Find the maximum production value to calculate the scale
    const maxProduction = Math.max(...data.map((entry) => entry[1]));
    const minProduction = Math.min(...data.map((entry) => entry[1]));

    const difference = maxProduction - minProduction;

    var originalPoint = 0;
    if (minProduction > 3 * difference) {
        originalPoint = minProduction - difference * (1 / 2);
    }

    // 如果数据之间的极差不到最小值的三分之一，那么原点就不设为零，转而设为最小值减去极差的二分之一，这样的话：数据之间的差距会更加明显易辨；


    // Calculate the scale for the bar chart based on the canvas height and the maximum production value
    const scale = (ctx.canvas.height - axisOffset * (3.5)) / (maxProduction - originalPoint); // Increase offset for labels
    console.log("scale: " + scale);
    console.log("originalPoint: " + originalPoint);
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
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
    // drawAxes(); 

    // Draw x-axis label
    ctx.fillStyle = config.font.color;
    ctx.font = `${config.font.size}px ${config.font.family}`;
    ctx.textAlign = "center";
    ctx.fillText("年份", ctx.canvas.width - axisOffset / 2, ctx.canvas.height - axisOffset / 2);

    // Draw y-axis label
    ctx.save();
    ctx.translate(axisOffset / 2, axisOffset);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("产量（万吨）", 0, 0);
    ctx.restore();


    const rotate = barWidth + barSpacing - config.font.size * 4;
    console.log(rotate);
    // Draw x-axis tick marks and labels
    data.forEach((entry, index) => {
        const year = entry[0];
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset;

        // Draw the tick mark
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 5);
        ctx.stroke();

        // Draw the year label
        if (rotate > 10) {
            ctx.fillText(year.toString(), x, y + axisOffset / 2);
        }
        else {
            ctx.save();
            console.log(year);
            ctx.textAlign = "center";
            ctx.translate(x + config.font.size / 2.5, y + axisOffset / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(year.toString(), 0, 0);
            ctx.restore();
        }
    });

    // Draw y-axis tick marks and labels
    const numTicks = 6; // Number of tick marks on the y-axis
    const tickStep = (maxProduction - originalPoint) / numTicks;
    console.log("tickStep: " + tickStep);
    for (let i = 0; i <= numTicks; i++) {
        const production = i * tickStep + originalPoint;
        const x = axisOffset;
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale;
        console.log("x : " + x + " y: " + y);
        // Draw the tick mark
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y);
        ctx.stroke();

        // Draw the production label
        ctx.fillText(production.toFixed(0), x - 26, y);
    }

    // Draw the bar chart and display production
    if (chartType === "bar" || chartType === "all") {
        data.forEach((entry, index) => {
            const year = entry[0];
            const production = entry[1];
            const x = axisOffset + index * (barWidth + barSpacing);
            const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale;

            if (config.bar.fillStyle === "gradientFill") {
                //如果是从左到右渐变
                if (config.bar.gradientStyle == "leftToRight") {
                    //试验区  
                    //实验成功 可以这样添加渐变色  在第一行代码哪里设置一个渐变的线条，
                    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
                    gradient.addColorStop(0, config.bar.startColor);    // 添加渐变的颜色和位置

                    gradient.addColorStop(1, config.bar.endColor);

                    // Draw the bar
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, production * scale);

                }
                //从上到下渐变
                if (config.bar.gradientStyle == "topToBottom") {
                    //试验区  
                    //实验成功 可以这样添加渐变色  在第一行代码哪里设置一个渐变的线条，
                    const gradient = ctx.createLinearGradient(x, y, x, y + production * scale);
                    gradient.addColorStop(0, config.bar.startColor);    // 添加渐变的颜色和位置

                    gradient.addColorStop(1, config.bar.endColor);

                    // Draw the bar
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, production * scale);

                }
            }

            if (config.bar.fillStyle === "singleFill") {
                ctx.fillStyle = config.bar.color;
                ctx.fillRect(x, y, barWidth, production * scale);
            }

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
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset - production * scale - config.font.size * 2;

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
    if (document.getElementById("lineStyle").value == "dashed") {
        ctx.setLineDash([4, 4]);
    }
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
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset - production * scale - config.font.size * 2.5;

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
    data = defaultData;
    displayFilter();
    drawInteractiveChart(data);
}


function handleDataChangeInput() {
    const rawData = document.getElementById("dataInput").value;
    data = parseData(rawData);
    displayFilter();
    drawInteractiveChart(data);
}

//show data filter column
function displayFilter() {
    console.log("display filter");

    let list = document.getElementById('dataList');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    // add a li for every data pair
    for (let i = 0; i < data.length; i++) {
        let listItem = document.createElement('li');
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = i;  //set checkbox's value with the index of the array
        checkbox.id = 'checkbox' + i;  // checkbox's unique id
        checkbox.checked = true;

        let label = document.createElement('label');
        label.htmlFor = 'checkbox' + i;  //associtate the label and checkbox
        label.textContent = "年份:" + data[i][0] + ", 产量:" + data[i][1];

        listItem.appendChild(checkbox);
        listItem.appendChild(label);

        list.appendChild(listItem);
    }

    // add change event
    let ul = document.getElementById('dataList');
    let items = ul.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function () {
            this.classList.toggle('selected');
            drawInteractiveChart(data);
        });
    }
}



//data filter
function dataFilter(data) {

    let indices = [];
    let list = document.getElementById('dataList');
    let checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (!checkbox.checked) {
            indices.push(checkbox.value);
        }
    }

    //filter out some data set;
    indices.sort((a, b) => b - a);
    for (let index of indices) {
        data.splice(index, 1);
    }
    // console.log('filter');
}



// Initial chart setup and rendering
config = getChartConfig();
drawInteractiveChart(data);
displayFilter();

// Event listeners for UI inputs
document.getElementById("chartType").addEventListener("change", handleChartTypeChange);
document.getElementById("lineColor").addEventListener("change", handleChartTypeChange);
document.getElementById("lineStyle").addEventListener("change", handleChartTypeChange);
document.getElementById("lineWidth").addEventListener("change", handleChartTypeChange);
document.getElementById("pointShape").addEventListener("change", handleChartTypeChange);
document.getElementById("pointColor").addEventListener("change", handleChartTypeChange);
document.getElementById("pointSize").addEventListener("change", handleChartTypeChange);
document.getElementById("fontFamily").addEventListener("input", handleChartTypeChange);
document.getElementById("fontSize").addEventListener("change", handleChartTypeChange);
document.getElementById("fontColor").addEventListener("change", handleChartTypeChange);
document.getElementById("default").addEventListener("click", handleDataChangeDefault);
document.getElementById("dataInputCheck").addEventListener("click", handleDataChangeInput);
//填充样式
document.getElementById("fillStyle").addEventListener("change", handleChartTypeChange);
document.getElementById("barColor").addEventListener("change", handleChartTypeChange);
//加上渐变色的选择
document.getElementById("startColor").addEventListener("change", handleChartTypeChange);
document.getElementById("endColor").addEventListener("change", handleChartTypeChange);
//渐变色的样式
document.getElementById("gradientStyle").addEventListener("change", handleChartTypeChange);
//
