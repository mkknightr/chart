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
    var barWidth = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 1.5)); // Width of each bar in the bar chart

    console.log(barWidth);
    var barSpacing = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 3)); // Spacing between bars in the bar chart
    console.log(barSpacing);

    if (data.length == 1) {
        barWidth = 200;
        barSpacing = 100;
    }
    // Find the maximum production value to calculate the scale
    const maxProduction = Math.max(...data.map((entry) => entry[1]));
    const minProduction = Math.min(...data.map((entry) => entry[1]));

    const difference = maxProduction - minProduction;

    var originalPoint = 0;
    if (minProduction > 3 * difference) {
        originalPoint = minProduction - difference * (1 / 2);
    }

    if (difference == 0) {
        originalPoint = 0;
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
        ctx.fillText(production.toFixed(1), x - 26, y);
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
                    //绘制边框
                    ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                    ctx.lineWidth = 2; // 设置边框线宽为2个像素
                    ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                    // Draw the bar
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);

                }
                //从上到下渐变
                if (config.bar.gradientStyle == "topToBottom") {
                    //试验区  
                    //实验成功 可以这样添加渐变色  在第一行代码哪里设置一个渐变的线条，
                    const gradient = ctx.createLinearGradient(x, y, x, y + (production - originalPoint) * scale);
                    gradient.addColorStop(0, config.bar.startColor);    // 添加渐变的颜色和位置

                    gradient.addColorStop(1, config.bar.endColor);
                    //绘制边框
                    ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                    ctx.lineWidth = 2; // 设置边框线宽为2个像素
                    ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                    // Draw the bar
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);

                }
            }
            else if (config.bar.fillStyle === "singleFill") {
                ctx.fillStyle = config.bar.color;
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // 设置边框颜色为黑色
                ctx.lineWidth = 1; // 设置边框线宽为2个像素
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
            }
            else if (config.bar.fillStyle === "dotFill") {
                //x y 矩形的坐上顶点 barwidth 矩形的宽度 (production - originalPoint) * scale 矩形的高度
                //barspacing 矩形之间的距离
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                //绘制小点
                drawDots(x, y, barWidth, (production - originalPoint) * scale);
                //绘制边框
                ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                ctx.lineWidth = 1; // 设置边框线宽为2个像素
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);

            }
            else if (config.bar.fillStyle === "lineFill") {
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                //绘制边框
                ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                ctx.lineWidth = 1; // 设置边框线宽为2个像素
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                //
                const gap = 8; // 直线间隔
                const lineWidth = 5; // 直线宽度
                const startX = x; // 矩形左上角的x坐标
                const endX = x + barWidth; // 矩形右下角的x坐标
                const startY = y; // 矩形左上角的y坐标
                const endY = y + ((production - originalPoint) * scale); // 矩形右下角的y坐标

                // 从左上角开始，绘制横向直线
                for (let y = startY; y <= endY; y += gap + lineWidth) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }

            }
            else if (config.bar.fillStyle === "meshFill") {
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                //绘制边框
                ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                ctx.lineWidth = 1; // 设置边框线宽为2个像素
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                //
                const gap = 8; // 直线间隔
                const lineWidth = 5; // 直线宽度
                const startX = x; // 矩形左上角的x坐标
                const endX = x + barWidth; // 矩形右下角的x坐标
                const startY = y; // 矩形左上角的y坐标
                const endY = y + ((production - originalPoint) * scale); // 矩形右下角的y坐标

                // 从左上角开始，绘制横向直线
                for (let y = startY; y <= endY; y += gap + lineWidth) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }
                // 从左上角开始，绘制纵向直线
                for (let x = startX; x <= endX; x += gap + lineWidth) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }


            }
            else {

                ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                ctx.lineWidth = 1; // 设置边框线宽为2个像素
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                //绘制小圈圈
                drawCircles(x, y, barWidth, (production - originalPoint) * scale);
                //绘制边框
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
            }

            ctx.fillStyle = "black"
            // Display production above the bar
            ctx.fillText(production.toString(), x + barWidth / 2, y - 5);

        });
    }

    // Draw the line chart and percentage labels
    if (chartType === "line" || chartType === "all") {
        drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing, originalPoint);
        drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing, originalPoint);
    }
}
//柱状图填充中点阵填充绘制小点的函数
function drawDots(x, y, width, height) {
    const ctx = getCanvasContext();
    const dotSize = 2; // 小点的大小
    const dotSpacing = 6; // 小点之间的间隔
    const columns = Math.floor(width / (dotSize + dotSpacing));
    const rows = Math.floor(height / (dotSize + dotSpacing));

    const offsetX = (width - columns * (dotSize + dotSpacing) + dotSpacing) / 2;
    const offsetY = (height - rows * (dotSize + dotSpacing) + dotSpacing) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const dotX = x + offsetX + col * (dotSize + dotSpacing);
            const dotY = y + offsetY + row * (dotSize + dotSpacing);
            ctx.fillStyle = 'black'; // 小点的颜色
            ctx.fillRect(dotX, dotY, dotSize, dotSize);
        }
    }
}
//小圈圈


// 绘制小圆圈函数
function drawCircles(x, y, width, height) {
    const circleRadius = 4; // 圆圈的半径
    const circleSpacing = 6; // 圆圈之间的间隔
    const ctx = getCanvasContext();
    const columns = Math.floor(width / (circleRadius * 2 + circleSpacing));
    const rows = Math.floor(height / (circleRadius * 2 + circleSpacing));

    const offsetX = (width - columns * (circleRadius * 2 + circleSpacing) + circleSpacing) / 2;
    const offsetY = (height - rows * (circleRadius * 2 + circleSpacing) + circleSpacing) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const circleX = x + offsetX + col * (circleRadius * 2 + circleSpacing) + circleRadius;
            const circleY = y + offsetY + row * (circleRadius * 2 + circleSpacing) + circleRadius;
            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'black'; // 圆圈边框的颜色
            ctx.stroke();
        }
    }
}



// 2. Function to draw the line and data points for the line chart
function drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing, originalPoint) {
    const ctx = getCanvasContext();
    const config = getChartConfig();

    // Calculate the line chart points with the adjusted scaling
    const points = data.map((entry, index) => {
        const year = entry[0];
        const production = entry[1];
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale - config.font.size * 2;

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
function drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing, originalPoint) {
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
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale - config.font.size * 2.5;

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




function handleScaleCanvas(event) { 
    let list = document.getElementById('dataList');
    let checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log(checkbox);
        }
    }

    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    const step = 0.1;
    var scale = 1.0;
    if (delta === 1) {
        scale += step;
    } else if (delta === -1) {
        scale -= step;
    }

    if (scale < 0.5) {
        scale = 0.5;
    }
    else if (scale > 2.0) {
        scale = 2.0;
    }
    console.log("---------------------------------####" + scale);
    clearCanvas();

    list = document.getElementById('dataList');
    checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log(checkbox);
        }
    }

    const ctx = getCanvasContext();

    const mouseX = event.clientX - ctx.canvas.offsetLeft;
    const mouseY = event.clientY - ctx.canvas.offsetTop;



    const offsetX = mouseX * (1 - scale);
    const offsetY = mouseY * (1 - scale);

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    list = document.getElementById('dataList');
    checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log(checkbox);
        }
    }
    drawInteractiveChart(data);
    list = document.getElementById('dataList');
    checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log(checkbox);
        }
    }
    // displayFilter(); 
    list = document.getElementById('dataList');
    checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log(checkbox);
        }
    }
}



function handleScaleReset() {
    clearCanvas();
    const ctx = getCanvasContext();
    scale = 1.0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    clearCanvas();
    drawInteractiveChart(data);
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
document.getElementById("chartCanvas").addEventListener("wheel", handleScaleCanvas);
document.getElementById("scaleResetButton").addEventListener("click", handleScaleReset);
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