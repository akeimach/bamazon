var inquirer = require("inquirer");
var connection = require("./connection.js")


runCustomer();

function runCustomer(query) {
    var productArr = [0];
    connection.query("SELECT item_id, product_name, price FROM products", function(error, response) {
        if (error) throw error;
        for (var i = 0; i < response.length; i++) {
            productArr.push(response[i]);
            for (var key in response[i]) {
                process.stdout.write(response[i][key] + "\t");
            }
            console.log();
        }
        inquirer.prompt([
            {
                type: "input",
                message: "What is the ID of the product you want to buy? [Quit with Q]",
                name: "itemId",
                validate: function (value) {
                    if (value.match(/[0-9]/) || value.match(/q/i)) return true;
                    return "You need to enter an ID number";
                }
            }
        ]).then(function(idResponse) {
            if (idResponse.itemId.match(/q/i)) {
                connection.end();
                return;
            }
            inquirer.prompt([
                {
                    type: "input",
                    message: "How many units would you like to buy? [Quit with Q]",
                    name: "itemQuant",
                    validate: function (value) {
                        if (value.match(/[0-9]/) || value.match(/q/i)) return true;
                        return "You need to enter a numerical quantity";
                    }
                }
            ]).then(function(quantResponse) {
                if (quantResponse.itemQuant.match(/q/i)) {
                    connection.end();
                    return;
                }
                connection.query("UPDATE products SET product_sales = (product_sales + (price * ?)), stock_quantity = (stock_quantity - ?) WHERE item_id = ? AND stock_quantity >= ?", [ parseInt(quantResponse.itemQuant), parseInt(quantResponse.itemQuant), parseInt(idResponse.itemId), parseInt(quantResponse.itemQuant) ], function(error2, response2) {
                    if (error2) throw error2;
                    if (response2.affectedRows === 0) {
                        console.log("INSUFFICIENT QUANTITY");
                    }
                    else {
                        console.log("ORDER COMPLETE!");
                        var totalPrice = (parseFloat(productArr[idResponse.itemId].price) * parseInt(quantResponse.itemQuant)).toFixed(2);
                        console.log("You paid: $" + totalPrice);
                    }
                    runCustomer();
                });
            });
        });
    });
}








