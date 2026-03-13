'html template

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to Uniflow</title>

<style>

body{
    margin:0;
    padding:0;
    background:#f4f6ff;
    font-family: Arial, Helvetica, sans-serif;
}

.wrapper{
    width:100%;
    padding:30px 0;
}

.container{
    max-width:600px;
    margin:auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 8px 30px rgba(0,0,0,0.06);
}

/* Logo Header */

.header{
    background:#ffffff;
    text-align:center;
    padding:30px 20px;
    border-bottom:1px solid #eeeeee;
}

.logo{
    width:150px;
}

/* Content */

.content{
    padding:40px;
}

h1{
    color:#02006d;
    font-size:24px;
    margin-bottom:15px;
}

p{
    font-size:15px;
    color:#444;
    line-height:1.6;
}

.brand{
    color:#5555e7;
    font-weight:600;
}

/* Steps */

.steps{
    background:#f7f8ff;
    border-left:4px solid #5555e7;
    padding:20px;
    border-radius:6px;
    margin:30px 0;
}

.steps h3{
    margin-top:0;
    color:#02006d;
}

.steps ul{
    margin:10px 0 0 18px;
}

.steps li{
    margin-bottom:8px;
}

/* Button */

.button-wrap{
    text-align:center;
    margin:30px 0;
}

.button{
    background:#5555e7;
    color:white;
    text-decoration:none;
    padding:14px 28px;
    border-radius:6px;
    font-weight:bold;
    display:inline-block;
}

/* Support */

.support{
    text-align:center;
    padding-top:20px;
    border-top:1px solid #eeeeee;
}

.support h3{
    color:#02006d;
    margin-bottom:10px;
}

.support a{
    color:#5555e7;
    text-decoration:none;
    font-weight:500;
}

/* Footer */

.footer{
    text-align:center;
    padding:20px;
    font-size:13px;
    color:#888;
    background:#fafaff;
}

</style>
</head>

<body>

<div class="wrapper">

<div class="container">

<!-- LOGO HEADER -->

<div class="header">
<img src="https://solby.sfo3.digitaloceanspaces.com/1773402357143-uniflow-logo.png" class="logo">
</div>

<!-- MAIN CONTENT -->

<div class="content">

<h1>Welcome to Uniflow, {{firstName}} 👋</h1>

<p>
Your account for <span class="brand">{{organization}}</span> has been successfully created.
</p>

<p>
Uniflow allows your organization to manage unified notifications across multiple channels including Email, SMS, and WhatsApp from one central platform.
</p>

<!-- GETTING STARTED -->

<div class="steps">

<h3>Getting Started</h3>

<ul>
<li>Access your Uniflow dashboard</li>
<li>Create your first notification template</li>
<li>Connect communication channels</li>
<li>Send your first unified notification</li>
</ul>

</div>

<div class="button-wrap">
<a href="{{dashboardUrl}}" class="button">Open Dashboard</a>
</div>

<!-- SUPPORT -->

<div class="support">

<h3>Need Help?</h3>

<p>
Email us at <a href="mailto:support@uniflow.io">support@uniflow.io</a>
</p>

<p>
or visit our support center
<br>
<a href="https://uniflow.io/support">Contact Support</a>
</p>

</div>

</div>

<!-- FOOTER -->

<div class="footer">
© 2026 Uniflow. All rights reserved
</div>

</div>

</div>

</body>
</html>

'sms template'

Welcome to Uniflow, {{firstName}}! 🎉

Your account for {{organization}} is ready.

Login to your dashboard:
{{dashboardUrl}}

Need help? support@uniflow.io


TEMPLATES

Request URL
https://smsapi.solby.io:8443/templates
Request Method
GET
Status Code
200 OK

[
    {
        "_id": "69b3fd0c742002794bb6fee0",
        "name": "Welcome to Uniflow SMS",
        "category": "Onboarding",
        "channel": "sms",
        "content": "Welcome to Uniflow, {{firstName}}! 🎉\n\nYour account for {{organization}} is ready.\n {{dashboardUrl}}\n\nNeed help? support@uniflow.io",
        "subject": "",
        "variables": [
            "firstName",
            "organization",
            "dashboardUrl"
        ],
        "usage": 0,
        "organization": "69945a3a9fc049de6a53d8dd",
        "createdBy": "69945a3a9fc049de6a53d8de",
        "createdAt": "2026-03-13T12:03:24.989Z",
        "updatedAt": "2026-03-13T12:03:24.989Z",
        "__v": 0
    },
    {
        "_id": "69b3fbe5742002794bb6fe86",
        "name": "Registration Confirmation",
        "category": "Onboarding",
        "channel": "email",
        "content": "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n<title>Welcome to Uniflow</title>\n\n<style>\n\nbody{\n    margin:0;\n    padding:0;\n    background:#f4f6ff;\n    font-family: Arial, Helvetica, sans-serif;\n}\n\n.wrapper{\n    width:100%;\n    padding:30px 0;\n}\n\n.container{\n    max-width:600px;\n    margin:auto;\n    background:#ffffff;\n    border-radius:12px;\n    overflow:hidden;\n    box-shadow:0 8px 30px rgba(0,0,0,0.06);\n}\n\n/* Logo Header */\n\n.header{\n    background:#ffffff;\n    text-align:center;\n    padding:30px 20px;\n    border-bottom:1px solid #eeeeee;\n}\n\n.logo{\n    width:150px;\n}\n\n/* Content */\n\n.content{\n    padding:40px;\n}\n\nh1{\n    color:#02006d;\n    font-size:24px;\n    margin-bottom:15px;\n}\n\np{\n    font-size:15px;\n    color:#444;\n    line-height:1.6;\n}\n\n.brand{\n    color:#5555e7;\n    font-weight:600;\n}\n\n/* Steps */\n\n.steps{\n    background:#f7f8ff;\n    border-left:4px solid #5555e7;\n    padding:20px;\n    border-radius:6px;\n    margin:30px 0;\n}\n\n.steps h3{\n    margin-top:0;\n    color:#02006d;\n}\n\n.steps ul{\n    margin:10px 0 0 18px;\n}\n\n.steps li{\n    margin-bottom:8px;\n}\n\n/* Button */\n\n.button-wrap{\n    text-align:center;\n    margin:30px 0;\n}\n\n.button{\n    background:#5555e7;\n    color:white;\n    text-decoration:none;\n    padding:14px 28px;\n    border-radius:6px;\n    font-weight:bold;\n    display:inline-block;\n}\n\n/* Support */\n\n.support{\n    text-align:center;\n    padding-top:20px;\n    border-top:1px solid #eeeeee;\n}\n\n.support h3{\n    color:#02006d;\n    margin-bottom:10px;\n}\n\n.support a{\n    color:#5555e7;\n    text-decoration:none;\n    font-weight:500;\n}\n\n/* Footer */\n\n.footer{\n    text-align:center;\n    padding:20px;\n    font-size:13px;\n    color:#888;\n    background:#fafaff;\n}\n\n</style>\n</head>\n\n<body>\n\n<div class=\"wrapper\">\n\n<div class=\"container\">\n\n<!-- LOGO HEADER -->\n\n<div class=\"header\">\n<img src=\"https://solby.sfo3.digitaloceanspaces.com/1773402357143-uniflow-logo.png\" class=\"logo\">\n</div>\n\n<!-- MAIN CONTENT -->\n\n<div class=\"content\">\n\n<h1>Welcome to Uniflow, {{firstName}} 👋</h1>\n\n<p>\nYour account for <span class=\"brand\">{{organization}}</span> has been successfully created.\n</p>\n\n<p>\nUniflow allows your organization to manage unified notifications across multiple channels including Email, SMS, and WhatsApp from one central platform.\n</p>\n\n<!-- GETTING STARTED -->\n\n<div class=\"steps\">\n\n<h3>Getting Started</h3>\n\n<ul>\n<li>Access your Uniflow dashboard</li>\n<li>Create your first notification template</li>\n<li>Connect communication channels</li>\n<li>Send your first unified notification</li>\n</ul>\n\n</div>\n\n<div class=\"button-wrap\">\n<a href=\"{{dashboardUrl}}\" class=\"button\">Open Dashboard</a>\n</div>\n\n<!-- SUPPORT -->\n\n<div class=\"support\">\n\n<h3>Need Help?</h3>\n\n<p>\nEmail us at <a href=\"mailto:support@uniflow.io\">support@uniflow.io</a>\n</p>\n\n<p>\nor visit our support center\n<br>\n<a href=\"https://uniflow.io/support\">Contact Support</a>\n</p>\n\n</div>\n\n</div>\n\n<!-- FOOTER -->\n\n<div class=\"footer\">\n© 2026 Uniflow. All rights reserved\n</div>\n\n</div>\n\n</div>\n\n</body>\n</html>",
        "subject": "Welcome to Uniflow Notifications",
        "variables": [
            "firstName",
            "organization",
            "dashboardUrl"
        ],
        "usage": 0,
        "organization": "69945a3a9fc049de6a53d8dd",
        "createdBy": "69945a3a9fc049de6a53d8de",
        "createdAt": "2026-03-13T11:58:29.429Z",
        "updatedAt": "2026-03-13T11:58:29.429Z",
        "__v": 0
    }
]

apikey- nk_597f569630e4ce3dab177f77f42bf21e1df5f6c8929b88af7c073c053bdbe7e8

