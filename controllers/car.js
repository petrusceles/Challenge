// const express = require('express');
// const {Op} = require('sequelize');
const {Car, Size, CarPicture} = require('../models')
const acceptedQueries = ['name','price','sizeId'];
const cloudinary = require('../config/cloudinary')

function uploadToCloudinary(image) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, (err, url) => {
        if (err) return reject(err);
        return resolve(url);
        })
    });
}

function destroyCloudinaryFile(publicId) {
    return new Promise((resolve,reject) => {
        cloudinary.uploader.destroy(publicId, (err,url) => {
            if (err) return reject(err);
            return resolve(url)
        })
    })
}

module.exports = {
    create: async (req,res) => {
        try {
            let {name,price,sizeId} = req.body;
            if (!name || !price || !sizeId || !req.file) {
                return res.status(400).json({
                    status:"BAD_REQUEST",
                    message:"all fields must not be empty",
                    data:{}
                })
            }
            // price = parseInt(price)
            console.log(typeof sizeId)
            const isCarExist = await Car.findOne({
                where: {
                    name
                }
            })

            if (isCarExist) {
                return res.status(400).json({
                    status:'BAD_REQUEST',
                    message:`car with name ${name} is already exist`,
                    data:{}
                })
            }

            const isSizeExist = await Size.findOne({
                where: {
                    id:sizeId
                }
            })

            if (!isSizeExist) {
                return res.status(400).json({
                    status:"BAD_REQUEST",
                    message:"size id doesn't exist",
                    data:{}
                })
            }
            const fileResponse = await uploadToCloudinary(req.fileEncoded);
            // console.log(fileResponse.public_id)
            const carPicture = await CarPicture.create({
                url:fileResponse.url,
                publicId:fileResponse.public_id
            })
            console.log(carPicture.dataValues.id)
            
            const newCar = await Car.create({
                name,
                price,
                sizeId,
                pictureId:carPicture.dataValues.id
            })
            
            return res.status(201).json({
                status:"OK",
                message:"car created",
                data:newCar
            })
        } catch (err) {
            res.status(500).json({
                status:'INTERNAL_SERVER_ERROR',
                message:err,
                data:{}
            })
        }
    },

    read: async (req,res) => {
        try {
            for (object in req.query) {
                if (!acceptedQueries.includes(object)) {
                    return res.status(400).json({
                        message:"unaccepted queries"
                    })
                }
            }
            // let query = req.query;
            // query.sizeId = parseInt(query.sizeId)

            const cars = await Car.findAll({
                where:req.query,
                include: [{
                    model:CarPicture,
                    as:'picture'
                },{
                    model:Size,
                    as:'size'
                }]
            })

            if (!cars) {
                return res.status(404).json({
                    status:'NOT_FOUND',
                    message:'not found',
                    data:{}
                });
            }

            return res.status(200).json({
                status:"OK",
                message:'car found',
                data:cars
            })
        } catch (err) {
            res.status(500).json({
                message:err,
                data:{}
            })
        }
    },

    readById: async (req,res) => {
        try {
            const {id} = req.params
            const car = await Car.findByPk(id)
            if (!car){
                return res.status(404).json({
                    status:"BAD_REQUEST",
                    message:`no car with id ${id}`
                });
            }
            return res.status(200).json({
                status:"OK",
                message:'car found',
                data:car
            })
        } catch (err) {
            res.status(500).json({
                message:err,
                data:{}
            })
        }
    },

    update: async (req,res) => {
        try {
            const {id} = req.params;
            const {name,price,sizeId} = req.body;
            const car = await Car.findOne({
                where:{
                    id
                },
                include: [{
                    model:CarPicture,
                    as:"picture"
                }, {
                    model:Size,
                    as:"size"
                }]
            })
            if (name) {
                const isCarNameExist = await Car.findOne({
                    where: {
                        name
                    }
                });
                if (isCarNameExist) {
                    return res.status(400).json({
                        status:"BAD_REQUEST",
                        message:`car with name ${name} is already exist`,
                        data:{}
                    })
                }
            }


            if (!car) {
                return res.status(404).json({
                    status:"NOT_FOUND",
                    message:`no car with id ${id}`,
                    data:{}
                })
            }
            let fileResponse;
            if (req.fileEncoded) {
                fileResponse = await uploadToCloudinary(req.fileEncoded);
            }

            // console.log(fileResponse)
            // if (fileResponse == null) fileResponse = undefined;
            let carPicture;
            if (fileResponse) {
                carPicture = await CarPicture.create({
                    url:fileResponse.url,
                    publicId:fileResponse.public_id
                })
            }

            let carPictureId = !fileResponse ? carPicture : carPicture.dataValues.id
            // console.log(size)
            const updatedCar = await Car.update({
                name,
                price,
                sizeId,
                pictureId:carPictureId
            },{
                where: {
                    id
                }
            })

            return res.status(200).json({
                status:"OK",
                message:"car updated",
                data:updatedCar
            })
        } catch (err) {
            res.status(500).json({
                message:err,
                data:{}
            })
        }
    },

    remove: async (req,res) => {
        try {
            const {id} = req.params;
            const deleted = await Car.destroy({
                where: {
                    id
                }
            })

            if (!deleted) {
                return res.status(404).json({
                    status:"NOT_FOUND",
                    message:'car not found',
                    data:deleted
                })
            }

            return res.status(200).json({
                status:"OK",
                message:"car deleted",
                data:{}
            })
        } catch (err) {
            res.status(500).json({
                message:err,
                data:{}
            })
        }
    }
}