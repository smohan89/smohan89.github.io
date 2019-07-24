// BUDGET CONTROLLER - holds all data structures
var budgetController = (function() {

    var Expense = function(id, description, value) {    // Function constructor to create objects for different expenses including id, desc, value as arguments
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    };
 
    var Income = function(id, description, value) {     // Function constructor to create objects for different income items including id, desc, value as arguments
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum; 
    };
 
    
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1     // so that no value exists
        
    };
 
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
 
            //create new ID for item added by user
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    
            else
                ID = 0;                                                   // [1 2 4 9], next ID = 10; ID = last ID + 1;    some ids can be removed with the x button
 
            // create new item with values 'id', 'desc', 'val' for new entry
            if(type === 'exp')
                newItem = new Expense(ID, des, val);
            else if(type === 'inc')
                newItem = new Income(ID, des, val);
 
            // add the item to data structure
            data.allItems[type].push(newItem);
 
            // return the new item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            // id = 6
            // data.allItems[type][id] won't work in a mixed up array
            // ids = [1 2 4 6 8]
            // index = 3

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget : function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the % of income that we spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
 
        testing: function() {
            console.log(data);
 
        }
    };
 
 })();
 
 // UI CONTROLLER
 var UIController = (function() {
 
     var DOMstrings = {                                          // collect input strings to make updating them easy, across the whole program
         inputType: '.add__type',
         inputDescription: '.add__description',
         inputValue: '.add__value',
         inputBtn: '.add__btn',
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

     var formatNumber = function(num, type) {
         var numSplit, int, dec, type;
        // +/- before number; exactly 2 decimal places; comma for thousands

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];            

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
     };

     var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
 
     return {
         getInput: function() {                                  // return object is accessible publicly or across modules
 
             return {
 
                 type: document.querySelector(DOMstrings.inputType).value,  // will be inc or exp
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
             };
         },

         addListItem: function(obj, type) {
            var html, newHtml, element;

            // create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }   else if(type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);           

         },

         deleteListItem: function(selectorID, itemID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

         },

         clearFields : function() {
             var fields, fieldsArr;
             fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +    // queryselectorAll to select multiple items
             DOMstrings.inputValue);

             fieldsArr = Array.prototype.slice.call(fields);        // convert list to array with slice call
             fieldsArr.forEach(function(current, index, array) {    // foreach method loops over all elements of an array
                 current.value = "";
             });
             fieldsArr[0].focus();
         },

         displayBudget: function(obj) {
             var type;
             obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');           

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
         },
 
         displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });

         },

         displayMonth: function() {
            var now, month, months, year;

            now = new Date();   // var Christmas = new Date(2016, 12, 25);

            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
         },

         changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
         },

         getDOMstrings : function() {                // returning the input strings to make them public
             return DOMstrings;
         }
     };
 
 })();
 
 // GLOBAL APP CONTROLLER
  var controller = (function(budgetCtrl, UICtrl) {
 
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
 
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
 
        document.addEventListener('keypress', function(event){   // keyboard listener
 
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };
 
    var updateBudget = function() {

        // 1. calculate budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. update UI with budget
        UICtrl.displayBudget(budget);
        

    };
 
    var updatePercentages = function() {

        // 1. Calculate percentages

        budgetCtrl.calculatePercentages();

        // 2. read percentages from budget controller

        var percentages = budgetCtrl.getPercentages();

        // 3. update UI with new percentages

        UICtrl.displayPercentages(percentages);

    };
 
     var ctrlAddItem = function() {
         var input, newItem;
 
         // 1. get the input field data
         var input = UICtrl.getInput();
 
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // 3. add the item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();
    
            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();
        }
 
     };

     var ctrlDeleteItem = function(event) {

        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);    // this was a string

            // delete item from data structure

            budgetCtrl.deleteItem(type, ID);

            // delete item from UI

            UICtrl.deleteListItem(itemID);

            // update and display budget

            updateBudget();
        }

     }
 
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
 
    })(budgetController, UIController);
 
  controller.init();