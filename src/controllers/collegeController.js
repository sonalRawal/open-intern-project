const collegeModel = require('../models/collegeModel')
const internModel = require("../models/internModel");


//!-----------------------------Functions--------------------------------------//
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// const createUrl = function(name){
//     let url = "https://functionup.s3.ap-south-1.amazonaws.com/colleges/"
//     let modifyUrl = `${url}${name}.png`
//     return modifyUrl
// }
//!--------------------------------------------------------------------//

const registerCollege = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide college details' })

        }
        
        // Extract body
        const { name, fullName,logoLink, isDeleted } = requestBody

        // validation Body
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "Please provide valid name" })
        }

        const isNameAlreadyRegister = await collegeModel.findOne({ name })
        
        if (isNameAlreadyRegister) {
            return res.status(400).send({ status: false, message: `${name} Name already registered` })
        }

        if (!isValid(fullName)) {
            return res.status(400).send({ status: false, message: "Please provide valid fullname" })
        }

         const isFullNameAlreadyRegister = await collegeModel.findOne({fullName})
         if (isFullNameAlreadyRegister){
             return res.status(400).send({status:false, message:`${fullName}FullName already Register`})
         }

        if (!isValid(logoLink)) {
            return res.status(400).send({ status: false, message: "Please provide valid logoLink" })
        }

        if (isDeleted == true) {
            res.status(400).send({ status: false, msg: "Cannot input isDeleted as true while registering" });
            return;
        }
        
        const nameTrim = name.trim()
        const collegeval = nameTrim.split(" ");
        const len = collegeval.length       
        if (len > 1) {
            return res.status(400).send({ status: false, msg: "Abbreviated college name should be in a single word" });
        }
        //----------------------------validation end------------------------//
    
        // requestBody['logoLink'] = createUrl(name)

        let data = await collegeModel.create(requestBody)
        let collegeResponse = await collegeModel.findOne(data).select({name:1,fullName:1,logoLink:1,isDeleted:1})
        return res.status(201).send({ status: true, message: collegeResponse })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

const getCollegeDetails = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false }
        const queryParam = req.query
        if (!isValidRequestBody(queryParam)) {
            res.status(400).send({ status: false, msg: "No query param received" });
            return;
        }

        const name1 = req.query.collegeName
        if (!isValid(name1))
         {
             return res.status(400).send({ status: false, message: 'Please provide valid query-Key' }) } 
         else { filterQuery['name'] = name1 }



        const college = await collegeModel.findOne(filterQuery)
        //console.log(college)
        
        if (!college) {
            res.status(400).send({ status: false, msg: "Either college details doesn't exist or Incorrect College name" });
            return;
        }
        //const interns = await internModel.find({ collegeId: college._id }).select({ isDeleted: 0, collegeId: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        //In place of .select() you can write directly like this
        const interns = await internModel.find({ collegeId: college._id, isDeleted: false}, { name: 1, email: 1, mobile: 1 })



        if (interns.length === 0) {
            res.status(400).send({ status: false, msg: "Interns details doesn't exist" });
            return;
        }

        const { name, fullName, logoLink } = college

        const response = { name: name, fullName: fullName, logoLink: logoLink }

        if (isValid(interns)) { response['interests'] = interns }

        return res.status(201).send({ status: true, data: response });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message });
    }


}










module.exports = { registerCollege, getCollegeDetails, isValid,isValidRequestBody }

