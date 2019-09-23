// ******** BUDGET CONTROLLER **********
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
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
        }
    }

})();

// ******** UI CONTROLLER **********
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
    }

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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

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
        getDOMStrings: () => {
            return DOMStrings;
        }

    }

})();

// ******** GLOBAL CONTROLLER **********
var controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = () => {

        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.key === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    }

    var updateBudget = () => {

        //1. calculate budget

        //2. return the budget

        //3. display in the UI
    }

    const ctrlAddItem = () => {
        var input, newItem;

        // 1. get the fileld data     
        input = UIController.getInput();
        console.log('input:' + input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to tyhe budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add item to the UI
            UIController.addListItem(newItem, input.type);

            // 3.1 Clear the fields
            UIController.clearFields();

            //4. Calculate and uodate budget
            updateBudget();
        }

    };

    return {
        init: () => {
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();