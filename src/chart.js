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



/**
 * 功能函数：获取canvas上下文
 * @returns canvas上下文
 */
function getCanvasContext() {
    return document.getElementById("chartCanvas").getContext("2d");
}

/**
 * 功能函数：清除画板
 */
function clearCanvas() {
    const ctx = getCanvasContext();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * 功能函数：输入数据处理
 * @param {输入的数据，未经处理的字符串形式} inputData 
 * @returns 返回二维data数组
 */
function parseData(inputData) {
    const data = [];
    const entries = inputData.split(';');
    for (const entry of entries) {
        const [year, value] = entry.split(',');
        data.push([parseInt(year), parseInt(value)]);
    }
    data.sort((a, b) => a[0] - b[0]);
    return data;
}

/**
 * 功能函数：获取图表的配置信息
 * @returns 返回html页面中能够获取的所有信息，并统一成具有结构的config对象
 */
function getChartConfig() {
    //折线
    const lineColor = document.getElementById("lineColor").value;
    const lineStyle = document.getElementById("lineStyle").value;
    const lineWidth = parseInt(document.getElementById("lineWidth").value);
    //点
    const pointShape = document.getElementById("pointShape").value;
    const pointColor = document.getElementById("pointColor").value;
    const pointSize = parseInt(document.getElementById("pointSize").value);
    //字体
    const fontFamily = document.getElementById("fontFamily").value;
    const fontSize = parseInt(document.getElementById("fontSize").value);
    const fontColor = document.getElementById("fontColor").value;
    //填充样式
    const fillStyle = document.getElementById("fillStyle").value;
    //填充颜色（纯色填充）
    const barColor = document.getElementById("barColor").value;
    //渐变颜色（渐变填充）
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


/**
 * 绘制主函数
 * @param {未经筛选处理过的数据} rawData 
 */
function drawInteractiveChart(rawData) {
    let data = JSON.parse(JSON.stringify(rawData));
    dataFilter(data);

    clearCanvas();
    const ctx = getCanvasContext();
    const chartType = document.getElementById("chartType").value; 
    config = getChartConfig();


    const axisOffset = 50; // 坐标轴标签偏移量（文字标签）
    const arrowSize = 10; // 坐标轴箭头大小


    var barWidth = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 1.5)); 
    var barSpacing = ((ctx.canvas.width - axisOffset * 2 - arrowSize) / (data.length * 3)); 
    
    // 对只有一个柱的情况进行单独设置 
    if (data.length == 1) {
        barWidth = 200;
        barSpacing = 100;
    }


    const maxProduction = Math.max(...data.map((entry) => entry[1]));
    const minProduction = Math.min(...data.map((entry) => entry[1]));
    const difference = maxProduction - minProduction;

    var originalPoint = 0;
    // 如果最小值大于极差的三倍，那么原点就是不设置为零，设置为最小值减去极差的一半
    if (minProduction > 3 * difference) {
        originalPoint = minProduction - difference * (1 / 2);
    }
    // 如果数据都是相同的，那么原点为零即可
    if (difference == 0) {
        originalPoint = 0;
    }
    const scale = (ctx.canvas.height - axisOffset * (3.5)) / (maxProduction - originalPoint); 
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';

    // 绘制x坐标轴
    ctx.beginPath();
    ctx.moveTo(axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset - arrowSize, ctx.canvas.height - axisOffset + arrowSize);
    ctx.moveTo(ctx.canvas.width - axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(ctx.canvas.width - axisOffset - arrowSize, ctx.canvas.height - axisOffset - arrowSize);
    ctx.stroke();

    // 绘制y坐标轴
    ctx.beginPath();
    ctx.moveTo(axisOffset, ctx.canvas.height - axisOffset);
    ctx.lineTo(axisOffset, axisOffset);
    ctx.lineTo(axisOffset - arrowSize, axisOffset + arrowSize);
    ctx.moveTo(axisOffset, axisOffset);
    ctx.lineTo(axisOffset + arrowSize, axisOffset + arrowSize);
    ctx.stroke();

    // 绘制x轴年份标签
    ctx.fillStyle = config.font.color;
    ctx.font = `${config.font.size}px ${config.font.family}`;
    ctx.textAlign = "center";
    ctx.fillText("年份", ctx.canvas.width - axisOffset / 2, ctx.canvas.height - axisOffset / 2);

    // 绘制y轴产量标签
    ctx.save();
    ctx.translate(axisOffset / 2, axisOffset);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("产量（万吨）", 0, 0);
    ctx.restore();

    // rotate用于x轴标签的自适应，如果两个年份即将交叉到一起，那么就将他们旋转，让他们在x轴上所占用的空间减小
    const rotate = barWidth + barSpacing - config.font.size * 4;
    // 绘制x轴的坐标点
    data.forEach((entry, index) => {
        const year = entry[0];
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 5);
        ctx.stroke();

        // 判断时候需要旋转，并绘制每个年份值
        if (rotate > 10) {
            ctx.fillText(year.toString(), x, y + axisOffset / 2);
        }
        else {
            ctx.save();
            ctx.textAlign = "center";
            ctx.translate(x + config.font.size / 2.5, y + axisOffset / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(year.toString(), 0, 0);
            ctx.restore();
        }
    });

    // 画y轴的坐标点
    const numTicks = 6; 
    const tickStep = (maxProduction - originalPoint) / numTicks;
    for (let i = 0; i <= numTicks; i++) {
        const production = i * tickStep + originalPoint;
        const x = axisOffset;
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y);
        ctx.stroke();

        ctx.fillText(production.toFixed(1), x - 26, y); // 保留了一位小数，是为了防止在某些情况下出现相同的标签
    }

    // 绘制柱状图 
    if (chartType === "bar" || chartType === "all") {
        data.forEach((entry, index) => {
            const production = entry[1];
            const x = axisOffset + index * (barWidth + barSpacing);
            const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale;

            // 绘制填充样式
            if (config.bar.fillStyle === "gradientFill") {
                if (config.bar.gradientStyle == "leftToRight") {
                    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
                    gradient.addColorStop(0, config.bar.startColor);    
                    gradient.addColorStop(1, config.bar.endColor);

                    ctx.strokeStyle = 'black'; 
                    ctx.lineWidth = 2; 
                    ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);

                }
                if (config.bar.gradientStyle == "topToBottom") {
                    const gradient = ctx.createLinearGradient(x, y, x, y + (production - originalPoint) * scale);
                    gradient.addColorStop(0, config.bar.startColor);
                    gradient.addColorStop(1, config.bar.endColor);

                    ctx.strokeStyle = 'black'; 
                    ctx.lineWidth = 2; 
                    ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);

                }
            }
            else if (config.bar.fillStyle === "singleFill") {
                ctx.fillStyle = config.bar.color;
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1; 
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
            }
            else if (config.bar.fillStyle === "dotFill") {
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                drawDots(x, y, barWidth, (production - originalPoint) * scale);    
                ctx.strokeStyle = 'black'; 
                ctx.lineWidth = 1; 
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);

            }
            else if (config.bar.fillStyle === "lineFill") {
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                ctx.strokeStyle = 'black'; 
                ctx.lineWidth = 1; 
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                const gap = 8; 
                const lineWidth = 5; 
                const startX = x; 
                const endX = x + barWidth; 
                const startY = y; 
                const endY = y + ((production - originalPoint) * scale); 
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
                ctx.strokeStyle = 'black'; 
                ctx.lineWidth = 1; 
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
                const gap = 8; 
                const lineWidth = 5; 
                const startX = x; 
                const endX = x + barWidth; 
                const startY = y; 
                const endY = y + ((production - originalPoint) * scale); 
                for (let y = startY; y <= endY; y += gap + lineWidth) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }
                for (let x = startX; x <= endX; x += gap + lineWidth) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }
            }
            else {
                ctx.strokeStyle = 'black'; 
                ctx.lineWidth = 1; 
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, barWidth, (production - originalPoint) * scale);
                drawCircles(x, y, barWidth, (production - originalPoint) * scale);
                ctx.strokeRect(x, y, barWidth, (production - originalPoint) * scale);
            }

            // 绘制数值标签
            ctx.fillStyle = "black"
            ctx.fillText(production.toString(), x + barWidth / 2, y - 5);

        });
    }

    // 绘制折线图
    if (chartType === "line" || chartType === "all") {
        drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing, originalPoint);
        drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing, originalPoint);
    }
}
/**
 * 功能函数：绘制柱状图点填充
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
function drawDots(x, y, width, height) {
    const ctx = getCanvasContext();
    const dotSize = 2; 
    const dotSpacing = 6; 
    const columns = Math.floor(width / (dotSize + dotSpacing));
    const rows = Math.floor(height / (dotSize + dotSpacing));

    const offsetX = (width - columns * (dotSize + dotSpacing) + dotSpacing) / 2;
    const offsetY = (height - rows * (dotSize + dotSpacing) + dotSpacing) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const dotX = x + offsetX + col * (dotSize + dotSpacing);
            const dotY = y + offsetY + row * (dotSize + dotSpacing);
            ctx.fillStyle = 'black'; 
            ctx.fillRect(dotX, dotY, dotSize, dotSize);
        }
    }
}



/**
 * 功能函数：绘制柱状图圆圈填充
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
function drawCircles(x, y, width, height) {
    const circleRadius = 4;
    const circleSpacing = 6;
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
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    }
}



/**
 * 功能函数：绘制折线图的数据点和折线
 * @param {*} data 
 * @param {*} scale 
 * @param {*} axisOffset 
 * @param {*} barWidth 
 * @param {*} barSpacing 
 * @param {*} originalPoint 
 */
function drawLineChartLineAndDataPoints(data, scale, axisOffset, barWidth, barSpacing, originalPoint) {
    const ctx = getCanvasContext();
    const config = getChartConfig();

    const points = data.map((entry, index) => {
        const production = entry[1];
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale - config.font.size * 2;

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

/**
 * 功能函数：绘制折线图的百分比和数据标签
 * @param {*} data 
 * @param {*} scale 
 * @param {*} axisOffset 
 * @param {*} barWidth 
 * @param {*} barSpacing 
 * @param {*} originalPoint 
 */
function drawLineChartPercentageLabels(data, scale, axisOffset, barWidth, barSpacing, originalPoint) {
    const ctx = getCanvasContext();
    const config = getChartConfig();

    const totalProduction = data.reduce((sum, entry) => sum + entry[1], 0);


    data.forEach((entry, index) => {
        const production = entry[1];
        const x = axisOffset + index * (barWidth + barSpacing) + barSpacing;
        const y = ctx.canvas.height - axisOffset - (production - originalPoint) * scale - config.font.size * 2.5;

        const percentage = ((production / totalProduction) * 100).toFixed(2) + "%";
        const dataPointOffset = 10; 

        ctx.fillStyle = config.font.color;
        ctx.font = `${config.font.size}px ${config.font.family}`;
        ctx.textAlign = "center";
        ctx.fillText(percentage, x, y - dataPointOffset);
    });
}
/**
 * 功能函数：图标配置变化处理函数
 */
function handleChartTypeChange() {
    drawInteractiveChart(data);
}

/**
 * 功能函数：使用默认数据处理函数
 */
function handleDataChangeDefault() {
    data = defaultData;
    displayFilter();
    drawInteractiveChart(data);
}


/**
 * 功能函数：数据输入改变处理函数
 */
function handleDataChangeInput() {
    const rawData = document.getElementById("dataInput").value;
    data = parseData(rawData);
    displayFilter();
    drawInteractiveChart(data);
}

/**
 * 功能函数：绘制筛选区
 */
function displayFilter() {

    let list = document.getElementById('dataList');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    for (let i = 0; i < data.length; i++) {
        let listItem = document.createElement('li');
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = i;  
        checkbox.id = 'checkbox' + i;  
        checkbox.checked = true;

        let label = document.createElement('label');
        label.htmlFor = 'checkbox' + i;  
        label.textContent = "年份:" + data[i][0] + ", 产量:" + data[i][1];

        listItem.appendChild(checkbox);
        listItem.appendChild(label);

        list.appendChild(listItem);
    }

    let ul = document.getElementById('dataList');
    let items = ul.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function () {
            this.classList.toggle('selected');
            drawInteractiveChart(data);
        });
    }
}



/**
 * 功能函数：筛选数据
 * @param {*} data 
 */
function dataFilter(data) {

    let indices = [];
    let list = document.getElementById('dataList');
    let checkboxes = list.getElementsByTagName('input');
    for (let checkbox of checkboxes) {
        if (!checkbox.checked) {
            indices.push(checkbox.value);
        }
    }

    indices.sort((a, b) => b - a);
    for (let index of indices) {
        data.splice(index, 1);
    }
}



/**
 * 功能函数：缩放处理函数
 * @param {鼠标滚轮滚动事件} event 
 */
function handleScaleCanvas(event) { 
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

    clearCanvas();
    const ctx = getCanvasContext();

    const mouseX = event.clientX - ctx.canvas.offsetLeft;
    const mouseY = event.clientY - ctx.canvas.offsetTop;

    const offsetX = mouseX * (1 - scale);
    const offsetY = mouseY * (1 - scale);

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawInteractiveChart(data);
}


/**
 * 功能函数：缩放重置处理函数
 */
function handleScaleReset() {
    clearCanvas();
    const ctx = getCanvasContext();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    clearCanvas();
    drawInteractiveChart(data);
}



// 页面初始化
config = getChartConfig();
drawInteractiveChart(data);
displayFilter();

// 添加时间监听器
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
document.getElementById("fillStyle").addEventListener("change", handleChartTypeChange);
document.getElementById("barColor").addEventListener("change", handleChartTypeChange);
document.getElementById("startColor").addEventListener("change", handleChartTypeChange);
document.getElementById("endColor").addEventListener("change", handleChartTypeChange);
document.getElementById("gradientStyle").addEventListener("change", handleChartTypeChange);