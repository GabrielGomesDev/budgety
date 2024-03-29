//***************************************************************************//
//**                           BUDGET CONTROLLER                           **//
//***************************************************************************//

var budgetController = (function () {

    var Expense = function (id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = (type) => {
        var sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: (type, des, val) => {
            var newItem, id;

            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: (type, id) => {
            var ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: () => {

            //calculate total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');
            //calc busget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            //calc % of the income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: () => {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: () => {
            var allPerc = data.allItems.exp.map((current) => {
                return current.getPercentage();
            });
            return allPerc;

        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage,
            }
        }
    }

})();

//***************************************************************************//
//**                           UI CONTROLLER                               **//
//***************************************************************************//


var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = (num, type) => {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
                    
    };

    var nodeListForEach = (list, callback) => {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: (obj, type) => {
            var html, newHtml, element;

            // Create HTML String with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: (id) => {
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },
        clearFields: () => {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach((current, index, array) => {
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: (object) => {

            var type;

            object.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(object.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(object.totalIncome, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(object.totalExpenses, 'exp');

            if (object.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = object.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        },
        displayPercentages: (percentages) => {
            var fields;

            fields = document.querySelectorAll(DOMStrings.expensesPercLabel); //returns a NODELIST, each element on the DOM is called a NODE

            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },
        displayMonth: () => {
            var now, year, month, months;
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = months[now.getMonth() -1];
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },    
        changeType: () => {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, (current) => {
                current.classList.toggle('red-focus');                
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        }, 
        getDOMStrings: () => {
            return DOMStrings;
        }

    }

})();

//***************************************************************************//
//**                           GLOBAL CONTROLLER                           **//
//***************************************************************************//

var controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = () => {

        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.key === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    var updateBudget = () => {

        //1. calculate budget
        budgetController.calculateBudget();
        //2. return the budget
        var budget = budgetController.getBudget();
        //3. display in the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = () => {
        //1. calc percentages
        budgetController.calculatePercentages();
        //2. read from budget controller
        var percentages = budgetController.getPercentages();
        console.log('updatePercentages: ' + percentages);
        //3. update ui
        UICtrl.displayPercentages(percentages);

    }

    const ctrlAddItem = () => {
        var input, newItem;

        // 1. get the fileld data     
        input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to tyhe budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add item to the UI
            UIController.addListItem(newItem, input.type);

            // 3.1 Clear the fields
            UIController.clearFields();

            //4. Calculate and uodate budget
            updateBudget();

            //5. Calculate and update percentages
            updatePercentages();
        }

    };

    const ctrlDeleteItem = (event) => {

        var itemId, splitId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            //1. delete item from data structure
            budgetController.deleteItem(type, id);

            //2. delete from ui
            UIController.deleteListItem(itemId);

            //3. update and show new totals
            updateBudget();

            //4. update percentages
            updatePercentages();
        }

    }

    return {
        init: () => {
            setupEventListeners();
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1,
            });
        }
    }

})(budgetController, UIController);

controller.init();