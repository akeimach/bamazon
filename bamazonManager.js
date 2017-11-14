var inquirer = require("inquirer");
var connection = require("./connection.js");
var cliTable = require("cli-table");

var productArr = [0];
var itemChoices = [];
var managerChoices = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"];

var questions = [
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: managerChoices
        }
    ];

var addQuestions = [
        {
            type: "list",
            message: "To which item would you like to add inventory?",
            name: "name",
            choices: itemChoices
        }, {
            type: "input",
            message: "How many would you like to add?",
            name: "quantity",
            validate: function (answers) {
                var num = parseInt(answers);
                if (Number.isInteger(num) && (num >= 0)) return true;
                return "You need to enter a positive integer";
            }
        }
    ];

var newQuestions = [
        {
            type: "input",
            message: "What is the name of the product you would like to add?",
            name: "name"
        }, {
            // TODO: Add list for departments available
            type: "input",
            message: "Which department does this product fall into?",
            name: "department"
        }, {
            type: "input",
            message: "How much does it cost?",
            name: "price",
            validate: function (answers) {
                if ((answers.match(/[0-9]+\.[0-9]{2}/)) && (parseFloat(answers) >= 0)) return true;
                return "You need to enter an amount in USD (#.##)";
            }
        }, {
            type: "input",
            message: "How many do we have?",
            name: "quantity",
            validate: function (answers) {
                var num = parseInt(answers);
                if (Number.isInteger(num) && (num >= 0)) return true;
                return "You need to enter a positive integer";
            }
        }
    ];


function queryTable(queryStr, callback) {
    var table = new cliTable({
        head: ["ID","Product Name","Price","Stock"],
        colWidths: [5, 25, 10, 10],
        colAligns: ["left", "left", "right", "right"]
    });
    connection.query(queryStr, function(selectErr, selectRes) {
        if (selectErr) throw selectErr;
        for (var i = 0; i < selectRes.length; i++) {
            var row = [];
            for (var key in selectRes[i]) {
                if (key === "price") {
                    row.push("$" + selectRes[i][key].toFixed(2));
                }
                else row.push(selectRes[i][key]);
            }
            table.push(row);
        }
        console.log(table.toString());
        callback();
    });
}


function addInventory() {
    connection.query(
            "SELECT item_id, " +
                "product_name, " +
                "price, " +
                "stock_quantity " +
            "FROM products",
            function(selectErr, selectRes) {
        if (selectErr) throw selectErr;
        for (var i = 0; i < selectRes.length; i++) {
            itemChoices[i] = selectRes[i].item_id + ") " + selectRes[i].product_name;
        }
        inquirer.prompt(addQuestions).then(function(addAnswers) {
            var productInfo = addAnswers.name.split(") ");
            var id = parseInt(productInfo[0]);
            var quantity = parseInt(addAnswers.quantity);
            connection.query(
                    "UPDATE products " +
                    "SET stock_quantity = (stock_quantity + ?) " +
                    "WHERE item_id = ?",
                    [ quantity, id ],
                    function(updateErr, updateRes) {
                if (updateErr) throw updateErr;
                if (!updateRes.affectedRows) console.log("Failed to add stock");
                else console.log("Added " + quantity + " of " + productInfo[1] + "!");
                runManager();
            });
        });
    });
}


function runManager() {
    inquirer.prompt(questions).then(function(answers) {
        switch (managerChoices.indexOf(answers.choice)) {
            case 0:
                console.log("ALL INVENTORY");
                var queryStr =
                    "SELECT item_id, " +
                        "product_name, " +
                        "price, " +
                        "stock_quantity " +
                    "FROM products";
                queryTable(queryStr, runManager);
                break;
            case 1:
                console.log("LOW INVENTORY");
                var queryStr =
                    "SELECT item_id, " +
                        "product_name, " +
                        "price, " +
                        "stock_quantity " +
                    "FROM products " +
                    "WHERE stock_quantity < 5";
                queryTable(queryStr, runManager);
                break;
            case 2:
                addInventory();
                break;
            case 3:
                inquirer.prompt(newQuestions).then(function(newAnswers) {
                    connection.query(
                            "INSERT INTO products " +
                            "(product_name, department_name, price, stock_quantity) " +
                            "VALUES (?, ?, ?, ?)",
                            [ newAnswers.name, newAnswers.department, parseFloat(newAnswers.price), parseInt(newAnswers.quantity) ],
                            function(insertErr, insertRes) {
                        if (insertErr) throw insertErr;
                        if (!insertRes.affectedRows) console.log("Failed to add item");
                        else console.log("Added " + parseInt(newAnswers.quantity) + " of " + newAnswers.name + " to Bamazon!");
                        runManager();
                    });
                });
                break;
            default:
                console.log("Goodbye");
                connection.end();
                break;
        }
    });
}


runManager();
