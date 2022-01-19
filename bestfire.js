// Copyright 2021 - BestMat - BestFire - All rights reserved.
const {Builder} = require('selenium-webdriver');
const { remote } = require('webdriverio');
const express = require('express');
const consola = require('consola');
const chalk = require('chalk');
const bestapp = require('./.bestapp/bestapp');
const fs = require('fs');
let browser
let document
let _dProps = {
    title: "",
};
let _utils = {
    getElementById: null,
    querySelector: null,
    click: null
}
let analysis = {
    browser: {
        name: "",
        score: 100
    },
    totalScore: [100, 0, 0]
}
const window = async function(browserName, url, callback) {
    analysis.browser.name = browserName
    if (browserName === "chrome") {
        let driver = await new Builder().forBrowser('chrome').build();
        await driver.get(url);
        analysis.totalScore = [100, 0, 0]
        _dProps.title = await driver.getTitle();
        console.clear()
        consola.success(`Success! The ${chalk.greenBright(browserName)} has been launched.`)
        consola.info(`Type ${chalk.bgWhiteBright(chalk.blackBright(chalk.italic("Command/Ctrl + C")))} to exit the application.`)
        analysis.success = true
        callback({
            document: {
                querySelector: (selector) => {
                    return driver.findElement(By.css(selector))
                    if (typeof selector === String){
                        return driver.findElement(By.css(selector))
                    }else{ 
                        consola.error(`The selector ${chalk.red(selector)} is invalid. Make sure it matches the correct class or id.`); 
                        return
                    }
                }, 
                name: (name) => {
                    return driver.findElement(driver.By.name(name));
                }
            },
            maximize: async function(){
                await driver.manage().window().maximize();
                analysis.maximize = true
            },
            newTab: async function(){
                await driver.switchTo().newWindow('tab');
                analysis.newTab = true;
            },
            newBrowserWindow: async function(){
                await driver.switchTo().newWindow('window');
                analysis.newBrowserWindow = true;
            },
            closeWindow: async function(){
                await driver.quit();
                analysis.closeWindow = true;;
            },
            location: function(){
                return {
                    redirect: async function(url){
                        await driver.get(url);
                    },
                    currentUrl: async function(){
                        return await driver.getCurrentUrl();
                    },
                    back: async function(){
                        await driver.navigate().back();
                    },
                    forward: async function(){
                        await driver.navigate().forward();
                    },
                    refresh: async function(){
                        await driver.navigate().refresh();
                    }
                }
            },
            _utils: function(){
                return { 
                    getElementById: async function(id){
                        if(typeof id === String){
                            //return driver.findElement(By.id(id));
                            _utils.getElementById = driver.findElement(By.id(id));
                        }else{
                            throw new Error("Element id is not a string.")
                            return;
                        }
                    }, 
                    querySelector: async function(selector){
                        if(selector === String){
                            //return driver.findElement(By.css(selector));
                            _utils.querySelector = driver.findElement(By.css(selector));
                        }else{
                            throw new Error("Selector is not a string.");
                            return;
                        }
                    }               
                }
            }
            
        });
    }else if(browserName === "edge"){
        browser = await remote({capabilities: {browserName: 'edge'}})  
        await browser.url(url)   
        analysis.totalScore = [0, 100, 0]
        const apiLink = await browser.$('=API')
        document =  {
            querySelector: async (selector) => {
                return await browser.$(selector)
            }
        }
        callback({
            document: {
                querySelector: async (selector) => {
                    return await browser.$(selector)
                }
            },
            maximize: () => browser.maximizeWindow(),
            closeWindow: async () => await browser.deleteSession(),
            takeScreenshot: async function(fileName){
                await apiLink.click()
                await browser.saveScreenshot(`./${fileName}.png`)
            },
            newBrowserWindow: () => browser.createWindow("window"),
            newTab: () => browser.createWindow(tab),
            print: () => browser.printPage(),
            location: () => {
                return {
                    redirect: (url) => browser.navigateTo(url),
                    currentUrl: () => {return browser.getUrl()},
                    back: () => browser.back(),
                    forward: () => browser.forward(), 
                    refresh: () => browser.refresh()
                }
           },
           _utils: () => {return {
               elementClick: (id) => browser.elementClick(id)
           }}
        })
        _utils.elementClick = (id) => browser.elementClick(id)
        }

    }
    const app = express();
    app.listen(3001, () => {
        consola.info(`For analysis, you can go to ${chalk.blueBright("http://localhost:3001")}`)
      })
    app.get("/", (req, res) => {
        res.sendFile(__dirname + '/analysis.html')
    })
    const f = () => fs.appendFile('analysis.json', JSON.stringify(analysis), function (err) {
        if (err) consola.error(err);
    });
    f()
window("edge", "https://www.youtube.com/", function (options){
    options.location().redirect("https://netflix.com")
})