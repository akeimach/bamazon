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
    runSupervisor();
});

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
            
            runSupervisor();
        }
        else {
            console.log("Goodbye");
            connection.end();
        }
    });
}


