const cds = require('@sap/cds')
const tx = cds.tx();
const axios = require('axios');

module.exports = cds.service.impl(async function (srv) {

    srv.on('READ', 'PDFdoc', async (req) => {
        // let OrderId = req.data.maintenanceOrder_ID;

        // let moOperation = await tx.run((SELECT.from(MaintenanceOrderOperation)).where({ maintenanceOrder: OrderId }));
        let moOperation = await tx.run((SELECT.from(MaintenanceOrderOperation)));

        let xmlData = `<form1><MaintenanceOrder>${moOperation[0].maintenanceOrder}</MaintenanceOrder><MaintenanceOrderOperation>${moOperation[0].maintenanceOrderOperation}</MaintenanceOrderOperation><OperationDescription>${moOperation[0].operationDescription}</OperationDescription></form1>`

        let vcap_services = JSON.parse(process.env.VCAP_SERVICES)

        if (vcap_services.adsrestapi !== undefined) {
            var username = vcap_services.adsrestapi[0].credentials.uaa.clientid
            var password = vcap_services.adsrestapi[0].credentials.uaa.clientsecret
            var authURL = vcap_services.adsrestapi[0].credentials.uaa.url
            var apiURL = vcap_services.adsrestapi[0].credentials.uri
        } else {
            return;
        }

        var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        var tokenOptions = {
            'method': 'POST',
            'url': authURL + "/oauth/token?grant_type=client_credentials",
            'headers': {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'redirect': 'follow'
        };

        const tokenResponse = await axios(tokenOptions);
        const tokenjson = await tokenResponse.json();
        const token = tokenjson.access_token;
        var bodyE = new Buffer(xmlData).toString('base64');
        var xdpVal = "riskform/RiskForm"

        var base64Pdf = JSON.stringify({
            "xdpTemplate": xdpVal,
            "xmlData": bodyE,
            "formType": "print",
            "formLocale": "",
            "taggedPdf": 1,
            "embedFont": 0
        })
        var options = {
            'method': 'POST',
            'url': apiURL + "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=2",
            'headers': {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: base64Pdf
        };
        const pdfContent = await axios(options)
        let result = new Array();
        result = {
            Id: riskID,
            pdfFile: pdfContent.data.fileContent
        };
        return result;
    });
});