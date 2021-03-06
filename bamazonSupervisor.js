var inquirer = require("inquirer");
var connection = require("./connection.js");
var cliTable = require("cli-table");

var supervisorChoices = ["View Product Sales by Department", "Create New Department", "Quit"];

var questions = [
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: supervisorChoices
        }
    ];

var deptQuestions = [
        {
            type: "input",
            message: "What is the new department named?",
            name: "department"
        }, {
            type: "input",
            message: "What is this department's overhead?",
            name: "overhead",
            validate: function (answers) {
                if ((answers.match(/[0-9]+\.[0-9]{2}/)) && (parseFloat(answers) >= 0)) return true;
                return "You need to enter an amount in USD (#.##)";
            }
        }
    ];


function queryTable(queryStr, callback) {
    var table = new cliTable({
        head: ["ID","Department Name","Overhead","Product Sales","Total Profit"],
        colWidths: [5, 20, 15, 15, 15],
        colAligns: ["left", "left", "right", "right", "right"]
    });
    connection.query(queryStr, function(selectErr, selectRes) {
        if (selectErr) throw selectErr;
        for (var i = 0; i < selectRes.length; i++) {
            var row = [];
            for (var key in selectRes[i]) {
                if ((key === "over_head_costs") || (key === "total_product_sales") || (key === "total_profit")) {
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


function runSupervisor() {
    inquirer.prompt(questions).then(function(answers) {
        switch (supervisorChoices.indexOf(answers.choice)) {
            case 0:
                var queryStr =
                    "SELECT b.department_id, " +
                        "b.department_name, " +
                        "b.over_head_costs, " +
                        "a.total_product_sales, " +
                        "a.total_product_sales - b.over_head_costs AS total_profit " +
                    "FROM (SELECT department_name, " +
                            "SUM(product_sales) AS total_product_sales " +
                            "FROM products GROUP BY department_name) a " +
                    "JOIN departments b ON a.department_name = b.department_name";
                queryTable(queryStr, runSupervisor);
                break;
            case 1:
                inquirer.prompt(deptQuestions).then(function(deptAnswers) {
                    connection.query(
                            "INSERT INTO departments " +
                            "(department_name, over_head_costs) " +
                            "VALUES (?, ?)",
                            [ deptAnswers.department, parseFloat(deptAnswers.overhead) ],
                            function(insertErr, insertRes) {
                        if (insertErr) throw insertErr;
                        if (!insertRes.affectedRows) console.log("Failed to add item");
                        else console.log("Added " + deptAnswers.department + " department to Bamazon!");
                        runSupervisor();
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


runSupervisor();
