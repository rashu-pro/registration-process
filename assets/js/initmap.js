/**
 * Integrated google map place api to autocomplete address
 */
function initMap() {
  let addressFieldsSelector = document.getElementsByClassName('street-address-js');
  for (let i = 0; i < addressFieldsSelector.length; i++) {
    let addressField = addressFieldsSelector[i];
    addressField.style.backgroundImage = "url('https://res.cloudinary.com/secure-api/image/upload/v1683720094/secure-api/Secure-api/images/mjomeg9bme4yuh2tlr5q.png')";
    addressField.style.backgroundRepeat = "no-repeat";
    addressField.style.backgroundPosition = "99% 50%";
    addressField.style.backgroundSize = "auto";
    const addressBlockSelector = addressField.closest('.address-autocomplete-block-js');
    // Create the autocomplete object
    const autocomplete = new google.maps.places.Autocomplete(addressField);

    // Set the fields to retrieve from the Places API
    // autocomplete.setFields(['formatted_address']);
    autocomplete.setFields(['address_components', 'formatted_address']);

    // When a place is selected, populate the address fields in your form
    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      if (!place.formatted_address) {
        console.log('No address available for this place.');
        loaderEnable(loaderDivClass);
        fetchCountries();
        return;
      }

      // Do something with the selected address
      // Retrieve the country, state, and city names from the address components
      let streetNumber, routeName, streetAddress, countryName, stateName, cityName, postalCode;
      for (const component of place.address_components) {
        if (component.types.includes('country')) {
          countryName = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          stateName = component.long_name;
        } else if (component.types.includes('locality') || component.types.includes('postal_town')) {
          cityName = component.long_name;
        }else if (component.types.includes('administrative_area_level_3')){
          if(!cityName) cityName = component.long_name;
        }else if(component.types.includes('postal_code')){
          postalCode = component.long_name;
        } else if(component.types.includes('street_number')){
          streetNumber = component.long_name;
        }else if(component.types.includes('route')){
          routeName = component.long_name;
        }
      }

      addressBlockSelector.querySelector('.input-city-js').value = '';
      addressBlockSelector.querySelector('.input-state-js').value = '';
      addressBlockSelector.querySelector('.input-country-js').value = '';
      addressBlockSelector.querySelector('.input-postal-code-js').value = '';

      // streetAddress = streetNumber && routeName ? streetNumber+" "+routeName : place.formatted_address.split(',')[0];
      streetAddress = place.formatted_address.split(',')[0];

      if(streetAddress) {
        addressBlockSelector.querySelector('.street-address-js').value = streetAddress;
        addressBlockSelector.querySelector('.street-address-js').focus();
      }

      if(cityName) {
        addressBlockSelector.querySelector('.input-city-js').value = cityName;
        removeInvalidClass(addressBlockSelector, '.input-city-js');
        addressBlockSelector.querySelector('.input-city-js').focus();
      }
      if(stateName) {
        addressBlockSelector.querySelector('.input-state-js').value = stateName;
        removeInvalidClass(addressBlockSelector, '.input-state-js');
        addressBlockSelector.querySelector('.input-state-js').focus();
      }
      if(postalCode) {
        addressBlockSelector.querySelector('.input-postal-code-js').value = postalCode;
        removeInvalidClass(addressBlockSelector, '.input-postal-code-js');
        addressBlockSelector.querySelector('.input-postal-code-js').focus();
      }
      if(countryName) {
        addressBlockSelector.querySelector('.input-country-js').value = countryName;
        removeInvalidClass(addressBlockSelector, '.input-country-js');
        addressBlockSelector.querySelector('.input-country-js').focus();
      }
    });
  }
}

function removeInvalidClass(addressBlockSelector, selector){
  if(!addressBlockSelector.querySelector(selector).closest('.form-group').querySelector('.error-message')) return;

  addressBlockSelector.querySelector(selector).classList.remove('field-invalid');
  addressBlockSelector.querySelector(selector).classList.remove('invalid');
  addressBlockSelector.querySelector(selector).closest('.form-group').querySelector('.error-message').remove();
}
