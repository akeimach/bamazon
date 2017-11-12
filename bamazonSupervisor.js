var inquirer = require("inquirer");
var connection = require("./connection.js")


runSupervisor();


// TODO: Add department_ids on the fly
function runSupervisor() {
    var supervisorChoices = ["View Product Sales by Department", "Create New Department", "Quit"];
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: supervisorChoices
        }
    ]).then(function(superResponse) {
        if (supervisorChoices.indexOf(superResponse.choice) === 0) {
            var departmentArr = [0];
            connection.query("SELECT b.department_id, b.department_name, " +
                 "b.over_head_costs, a.total_product_sales, " +
                 "b.over_head_costs - a.total_product_sales AS total_profit " +
                 "FROM (SELECT department_name, " +
                 "SUM(product_sales) AS total_product_sales " +
                 "FROM products GROUP BY department_name) a " +
                 "JOIN departments b " +
                 "ON a.department_name = b.department_name", function(error, response) {
                if (error) throw error;
                console.log("Department ID\tDepartment Name\tOverhead Costs\tProduct Sales\tTotal Profit");
                for (var i = 0; i < response.length; i++) {
                    departmentArr.push(response[i]);
                    for (var key in response[i]) {
                        process.stdout.write(response[i][key] + "\t");
                    }
                    console.log();
                }
                runSupervisor();
            });
        }
        else if (supervisorChoices.indexOf(superResponse.choice) === 1) {
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the new department named?",
                    name: "deptName"
                }
            ]).then(function(superResponse1) {
                inquirer.prompt([
                    {
                        type: "input",
                        message: "What's the overhead for " + superResponse1.deptName + "?",
                        name: "deptOverhead",
                        validate: function (value) {
                            if (value.match(/[0-9]+\.[0-9]{2}/)) return true;
                            return "You need to enter an amount in USD (#.##)";
                        }
                    }
                ]).then(function(superResponse2) {
                    connection.query("INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)", [ superResponse1.deptName, parseFloat(superResponse2.deptOverhead) ], function(error, response) {
                        if (error) throw error;
                        if (response.affectedRows === 0) {
                            console.log("Failed to add item");
                        }
                        else {
                            console.log("Added " + superResponse1.deptName + " department to Bamazon!");
                        }
                        runSupervisor();
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


