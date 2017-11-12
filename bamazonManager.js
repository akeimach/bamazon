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
    runManager();
});


function runManager() {
    var managerChoices = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"];
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: managerChoices
        }
    ]).then(function(managerResponse) {
        if (managerChoices.indexOf(managerResponse.choice) === 0) {
            // view products for sale
            var productArr = [0];
            connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(error, response) {
                if (error) throw error;
                console.log("Item ID\tProduct Name\tPrice\tStock Quantity");
                for (var i = 0; i < response.length; i++) {
                    productArr.push(response[i]);
                    for (var key in response[i]) {
                        process.stdout.write(response[i][key] + "\t");
                    }
                    console.log();
                }
                runManager();
            });

        }
        else if (managerChoices.indexOf(managerResponse.choice) === 1) {
            // view low inventory
            var productArr = [0];
            connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(error, response) {
                if (error) throw error;
                console.log("Item ID\tProduct Name\tPrice\tStock Quantity");
                for (var i = 0; i < response.length; i++) {
                    productArr.push(response[i]);
                    for (var key in response[i]) {
                        process.stdout.write(response[i][key] + "\t");
                    }
                    console.log();
                }
                runManager();
            });
        }
        else if (managerChoices.indexOf(managerResponse.choice) === 2) {
            // add to inventory
            //   * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
            var productArr = [0];
            var itemChoices = [];
            connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(error, response) {
                if (error) throw error;
                for (var i = 0; i < response.length; i++) {
                    productArr.push(response[i]);
                    itemChoices.push(response[i].item_id + ") " + response[i].product_name);
                }
                inquirer.prompt([
                    {
                        type: "list",
                        message: "To which item would you like to add inventory?",
                        name: "itemId",
                        choices: itemChoices
                    }
                ]).then(function(itemResponse) {
                    var productArray = itemResponse.itemId.split(") ");
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "How many " + productArray[1] + "s would you like to add?",
                            name: "itemNum",
                            validate: function (value) {
                                if (value.match(/[0-9]/)) return true;
                                return "You need to enter a numerical quantity";
                            }
                        }
                    ]).then(function(numberResponse) {
                        connection.query("UPDATE products SET stock_quantity = (stock_quantity + ?) WHERE item_id = ?", [ parseInt(numberResponse.itemNum), parseInt(productArray[0]) ], function(error, response) {
                            if (error) throw error;
                            if (response.affectedRows === 0) {
                                console.log("Failed to add stock");
                            }
                            else {
                                console.log("Added " + parseInt(numberResponse.itemNum) + " " + productArray[1] + "s!");
                            }
                            runManager();
                        });
                    });
                });
            });
            
        }
        else if (managerChoices.indexOf(managerResponse.choice) === 3) {
            // Add new product
            //   * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the name of the product you would like to add?",
                    name: "itemName"
                }
            ]).then(function(addResponse1) {
                inquirer.prompt([
                    {
                        type: "input",
                        message: "Which department does this product fall into?",
                        name: "itemDepartment"
                    }
                ]).then(function(addResponse2) {
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "How much does it cost?",
                            name: "itemCost",
                            validate: function (value) {
                                if (value.match(/[0-9]+\.[0-9]{2}/)) return true;
                                return "You need to enter an amount in USD (#.##)";
                            }
                        }
                    ]).then(function(addResponse3) {
                        inquirer.prompt([
                            {
                                type: "input",
                                message: "How many do we have?",
                                name: "itemQuant",
                                validate: function (value) {
                                    if (value.match(/[0-9]/)) return true;
                                    return "You need to enter a numerical quantity";
                                }
                            }
                        ]).then(function(addResponse4) {
                            console.log(addResponse1.itemName, addResponse2.itemDepartment, addResponse3.itemCost, addResponse4.itemQuant);
                            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [ addResponse1.itemName, addResponse2.itemDepartment, parseFloat(addResponse3.itemCost), parseInt(addResponse4.itemQuant) ], function(error, response) {
                                if (error) throw error;
                                if (response.affectedRows === 0) {
                                    console.log("Failed to add item");
                                }
                                else {
                                    console.log("Added " + parseInt(addResponse4.itemQuant) + " " + addResponse1.itemName + "s to Bamazon!");
                                }
                                runManager();
                            });
                        });
                    });
                });
            });
        }
        else {
            console.log("Goodbye");
            connection.end();
        }
    });
}






