var inquirer = require("inquirer");
var connection = require("./connection.js");
var cliTable = require("cli-table");

var maxID = 0;
var productArr = [0];
var questions = [
        {
            type: "input",
            message: "What is the ID of the product you want to buy? [Quit with Q]",
            name: "id",
            validate: function (answers) {
                var num = parseInt(answers);
                if (Number.isInteger(num) && (num >= 0) && (num <= maxID)) return true;
                if (answers.match(/q/i)) return true;
                return "You need to enter a valid ID number";
            }
        }, {
            type: "input",
            message: "How many units would you like to buy? [Quit with Q]",
            name: "quantity",
            validate: function (answers) {
                var num = parseInt(answers);
                if (Number.isInteger(num) && (num >= 0)) return true;
                if (answers.match(/q/i)) return true;
                return "You need to enter a positive integer";
            },
            when: function (answers) {
                if (answers.id.match(/q/i)) return false; // don't ask this question
                return true;
            }
        }
    ];


function runCustomer(query) {
    var table = new cliTable({
        head: ["ID","Product Name","Price"],
        colWidths: [5, 30, 10],
        colAligns: ["left", "left", "right"]
    });
    connection.query(
            "SELECT item_id, " +
                "product_name, " +
                "price " +
            "FROM products",
            function(selectErr, selectRes) {
        if (selectErr) throw selectErr;
        maxID = selectRes.length;
        for (var i = 0; i < selectRes.length; i++) {
            productArr.push(selectRes[i]); // save rows to calculate total price later
            var row = [];
            for (var key in selectRes[i]) {
                if (key === "price") {
                    row.push("$" + selectRes[i][key].toFixed(2));
                }
                else row.push(selectRes[i][key]);
            }
            table.push(row);
        }
        console.log(table.toString()); // console log the entire cli table
        inquirer.prompt(questions).then(function(answers) {
            if ((answers.id.match(/q/i)) || (answers.quantity.match(/q/i))) {
                connection.end();
                return;
            }
            var quantity = parseInt(answers.quantity);
            var id = parseInt(answers.id);
            var totalPrice = parseFloat((parseFloat(productArr[id].price) * quantity).toFixed(2));
            connection.query(
                    "UPDATE products " +
                    "SET product_sales = (product_sales + ?), " +
                        "stock_quantity = (stock_quantity - ?) " +
                    "WHERE item_id = ? AND stock_quantity >= ?",
                    [ totalPrice, quantity, id, quantity ],
                    function(updateErr, updateRes) {
                if (updateErr) throw updateErr;
                if (!updateRes.affectedRows) console.log("INSUFFICIENT QUANTITY");
                else console.log("ORDER COMPLETE! You paid: $" + totalPrice);
                runCustomer();
            });
        });
    });
}


runCustomer();
