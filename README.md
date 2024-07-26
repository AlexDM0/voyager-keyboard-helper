# Voyager keyboard helper       

This utiliy will help you create a custom keyboard layout for your Voyager keyboard.
    
If you want to use the Oryx configurator, but need the qmk firmware level features, this can help!

My setup uses the following features not available in Oryx:
- Achordion
- Permissive hold per key 
- Hold tap per key
- Unlimited length macros


## How to use 

first install the dependencies:

```bash 
npm install
```

Checkout the qmk firmware from zsa/qmk_firmware somewhere on your system:

```bash 
git clone https://github.com/zsa/qmk_firmware 
```

Copy the config template

```bash
cp config.template.js config.js
```

Edit the config.js file to point to the qmk_firmware directory you just checked out, as well as your other preferences.

Take a look at the modifyFirmware.js to see how it works. You can use the snippets to insert your own code. 

Run the script:

```bash
node updateKeyboard.js
```

or via the shell script which you can add to your PATH:

```bash 
./flashKeyboard.sh
```

#
