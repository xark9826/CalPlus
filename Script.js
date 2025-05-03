document.addEventListener('DOMContentLoaded', function() {
    const calculatorContainer = document.getElementById('calculator-container');
    const addCalculatorBtn = document.getElementById('add-calculator');
    const operationPopup = document.getElementById('operation-popup');
    let calculatorCount = 0;
    let draggedValue = null;
    let targetCalculator = null;

    // Helper: Create a new calculator
    function createCalculator(id) {
        const calculator = document.createElement('div');
        calculator.className = 'calculator';
        calculator.id = `calc-${id}`;
        calculator.innerHTML = `
            <div class="calculator-header">
                <div class="calculator-title">Calculator ${id}</div>
                <button class="close-btn" title="Close">&times;</button>
            </div>
            <div class="display">
                <div class="expression" contenteditable="true"></div>
                <div class="result" draggable="true">0</div>
            </div>
            <div class="keyboard">
                <button class="btn clear">C</button>
                <button class="btn backspace">⌫</button>
                <button class="btn operator">%</button>
                <button class="btn operator">÷</button>
                <button class="btn number">7</button>
                <button class="btn number">8</button>
                <button class="btn number">9</button>
                <button class="btn operator">×</button>
                <button class="btn number">4</button>
                <button class="btn number">5</button>
                <button class="btn number">6</button>
                <button class="btn operator">-</button>
                <button class="btn number">1</button>
                <button class="btn number">2</button>
                <button class="btn number">3</button>
                <button class="btn operator">+</button>
                <button class="btn number">0</button>
                <button class="btn number">.</button>
                <button class="btn equals">=</button>
            </div>
        `;
        return calculator;
    }

    // Helper: Initialize calculator logic
    function initCalculator(calculator) {
        const expression = calculator.querySelector('.expression');
        const result = calculator.querySelector('.result');
        const buttons = calculator.querySelectorAll('.btn');
        const closeBtn = calculator.querySelector('.close-btn');

        // Button click events
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('number') || button.classList.contains('operator')) {
                    expression.textContent += button.textContent;
                } else if (button.classList.contains('equals')) {
                    try {
                        let calculationExpression = expression.textContent
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/')
                            .replace(/%/g, '/100');
                        const calculationResult = eval(calculationExpression);
                        result.textContent = (calculationResult === undefined || isNaN(calculationResult)) ? 'Error' :
                            Number.isInteger(calculationResult) ? calculationResult : calculationResult.toFixed(4);
                    } catch (error) {
                        result.textContent = 'Error';
                    }
                } else if (button.classList.contains('clear')) {
                    expression.textContent = '';
                    result.textContent = '0';
                } else if (button.classList.contains('backspace')) {
                    expression.textContent = expression.textContent.slice(0, -1);
                }
            });
        });

        // Drag and drop result
        result.addEventListener('dragstart', function(e) {
            draggedValue = this.textContent;
            this.classList.add('dragging');
        });

        result.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });

        calculator.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        calculator.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedValue && draggedValue !== 'Error' && draggedValue !== '0') {
                targetCalculator = this;
                const rect = e.target.getBoundingClientRect();
                operationPopup.style.display = 'block';
                operationPopup.style.left = `${e.clientX}px`;
                operationPopup.style.top = `${e.clientY}px`;
            }
        });

        // Close button logic
        closeBtn.addEventListener('click', function() {
            // Only allow removing if more than one calculator
            if (document.querySelectorAll('.calculator').length > 1) {
                calculator.classList.add('removing');
                setTimeout(() => calculator.remove(), 300);
            }
        });

        // Prevent removing the last calculator
        updateCloseButtons();
    }

    // Add the first calculator on load
    function addCalculator() {
        calculatorCount++;
        const newCalculator = createCalculator(calculatorCount);
        calculatorContainer.insertBefore(newCalculator, addCalculatorBtn);
        initCalculator(newCalculator);
        updateCloseButtons();
    }

    // Ensure at least one calculator remains (hide close button if only one)
    function updateCloseButtons() {
        const calculators = document.querySelectorAll('.calculator');
        calculators.forEach(calc => {
            const closeBtn = calc.querySelector('.close-btn');
            if (calculators.length === 1) {
                closeBtn.style.visibility = 'hidden';
            } else {
                closeBtn.style.visibility = 'visible';
            }
        });
    }

    // Add calculator on "+" button click
    addCalculatorBtn.addEventListener('click', addCalculator);

    // Add the initial calculator
    addCalculator();

    // Popup operator selection
    const popupButtons = document.querySelectorAll('.popup-btn');
    popupButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (targetCalculator) {
                const expression = targetCalculator.querySelector('.expression');
                const operator = this.getAttribute('data-op');
                // Add the dragged value with selected operator to the expression
                expression.textContent += ` ${operator} ${draggedValue}`;
                // Hide popup
                operationPopup.style.display = 'none';
                // Reset variables
                draggedValue = null;
                targetCalculator = null;
            }
        });
    });

    // Close popup when clicking outside
    document.addEventListener('mousedown', function(e) {
        if (!operationPopup.contains(e.target) && e.target.className !== 'result') {
            operationPopup.style.display = 'none';
        }
    });

    // Optional: Prevent accidental selection of result text
    document.body.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('result')) {
            e.dataTransfer.setData('text/plain', e.target.textContent);
        }
    });
});
