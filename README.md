Angular client for Bitrefill API. http://docs.bitrefill.apiary.io/
  
## Usage
  
Set up in your ``config`` method:
  
  ````
  bitrefillProvider.setCredentials(
    '<API_KEY>',
    '<API_SECRET>'
  );
  ````
  
Then you can use ``bitrefill`` service in your code
