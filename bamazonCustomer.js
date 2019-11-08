require("dotenv").config();
var mysql = require('mysql');
var inquirer = require('inquirer');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3000,
    user: "root",
    password: "Prometheus07_",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    showProducts();
});

connection.connect(function (err) {
    if (err) throw err;
    connection.query("SELECT * FROM product", function showProducts(err, result) {
        if (err) throw err;
        console.log(result);
        start();
    });
});



function start() {
    inquirer.prompt([
        {
            name: "item_id",
            message: "Please enter the ID number of desired product:",
            type: "number"
        },
        {
            name: "quantity_desired",
            message: "Enter  quantity:",
            type: "number",
            validate: function (val) {
                if (val < 1) {
                    return "No negatives or 0's";
                } else return true;
            }
        }
    ]).then(function (response) {
        connection.query(

            "SELECT * FROM product WHERE item_id = ?", [response.id],
            function (err, res) {
                if (err) throw err;
                if (res.stock_quantity < response.quantity_desired) {//
                    if (res.stock_quantity <= 0) {//
                        console.log(`\nWe're out, come back later.\n`);
                    } else {
                        console.log(`\nThere are ${res.stock_quantity.toString()} items left.\n`);//
                    }
                    statusCheck();
                } else {
                    connection.query(
                        "UPDATE product SET stock_quantity = stock_quantity - ?", [response.quantity_desired, response.quantity_desired * res.price, response.id],//
                        function (err) {
                            if (err) throw err;
                            console.log("\nThank you for your purchase!" +
                                `\nItem ${res.item_id} - ${res.product_name} - quantity_desired. ${response.quantity_desired}`);//
                            statusCheck();
                        }
                    );
                }
            }
        );
    });
};
//};
function statusCheck() {
    inquirer.prompt(
        {
            name: "continue",
            message: "Do you want to continue ordering? Type 'n' to exit.)",
            type: "confirm"
        }
    ).then(function (response) {
        if (response.continue) {
            console.log("\n");
            showProducts();
        }
        else connection.end();
    });
}