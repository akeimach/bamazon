var inquirer = require("inquirer");
var mysql = require("mysql");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});


connection.connect(function(error) {
    if (error) throw error;
    console.log("connected as id " + connection.threadId);
    console.log("I have connected to mysql!");
    runCustomer();
});


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
                message: "What is the ID of the product you want to buy?",
                name: "itemId",
                validate: function (value) {
                    if (value.match(/[0-9]/)) return true;
                    return "You need to enter an ID number";
                }
            }
        ]).then(function(idResponse) {
            inquirer.prompt([
                {
                    type: "input",
                    message: "How many units would you like to buy?",
                    name: "itemQuant",
                    validate: function (value) {
                        if (value.match(/[0-9]/)) return true;
                        return "You need to enter a quantity";
                    }
                }
            ]).then(function(quantResponse) {
                connection.query("UPDATE products SET product_sales = (product_sales + ?), stock_quantity = (stock_quantity - ?) WHERE item_id = ? AND stock_quantity >= ?", [ parseInt(quantResponse.itemQuant), parseInt(quantResponse.itemQuant), parseInt(idResponse.itemId), parseInt(quantResponse.itemQuant) ], function(error2, response2) {
                    if (error2) throw error2;
                    if (response2.affectedRows === 0) {
                        console.log("INSUFFICIENT QUANTITY");
                    }
                    else {
                        console.log("ORDER COMPLETE!");
                        var totalPrice = parseFloat(productArr[idResponse.itemId].price) * parseInt(quantResponse.itemQuant);
                        console.log("You paid: $" + totalPrice);
                    }    
                });
            });
        });
        // connection.end();
    });
}







