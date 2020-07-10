//budget module
var budgetController = (function (){

    var Expense = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
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
    };

    return {
        addItem: function(type, desc, val){
            var newItem;

            //create a new ID based on last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if ( type === 'inc'){
                newItem = new Income(ID, desc, val);
            }
            //push new item to array
            data.allItems[type].push(newItem);

            //return new item.
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            //map returns a brand new array
            var ids= data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage
            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();


//UI module
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage'
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                desc: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                add: document.querySelector(DOMStrings.inputBtn).value
            }
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            //create HTML sting with placeholder text
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMStrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectedId){
            var el = document.getElementById(selectedId);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);

            //convert list to array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
            
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        getDOMStrings: function () {
            return DOMStrings;
            
        }
    };

})();



//Global app controller
var controller = (function(budgetCtrl, UICtrl){

    var setEventListeners = function (){
        
        var DOM = UICtrl.getDOMStrings();
        console.log(DOM);
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            //console.log(event);
            if (event.keyCode === 13 || event.which === 13)
            {
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
    };

    var ctrlAddItem = function (){
        var input, newItem;
        //Get input data
        input = UIController.getInput();

        if (input.desc !== "" && !isNaN(input.value) && input.value > 0)
        {
            //Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

            //Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            //clear fields
            UICtrl.clearFields();

            //calc and update budget
            updateBudget();

        }

    };

    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

      
        if (itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]); 

            console.log(type + ' ' + ID);
            //delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // delete from UI
            UICtrl.deleteListItem(itemId);

            //update and display new budget on UI
            updateBudget();
        }

    }
    var updateBudget = function(){
        //Calculate budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
         UICtrl.displayBudget(budget);
    }
    return {
        init: function() {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0

            });
            setEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();