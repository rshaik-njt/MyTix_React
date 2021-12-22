
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.png">
    <meta name="version" content="MyTix_Portal_2.0.l">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="NJ Transit" content="NJ Transit | New Jersey Transit Corporation | New Jersey"/>
     <base href="/mytix-portal/">
    <title>NJ Transit | New Jersey Transit Corporation | New Jersey</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div> 
    <script src="https://cdn.polyfill.io/v3/polyfill.min.js?features=default,Array.prototype.includes,Array.prototype.find"></script>

    <!-- <script>
        if('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw_eticketing.js')
                  .then((reg) => console.log('eticketing Success: ', reg.scope))
                  .catch((err) => console.log('eticketing Failure: ', err));
            })
        }

    </script> -->
   
  </body>
</html>
