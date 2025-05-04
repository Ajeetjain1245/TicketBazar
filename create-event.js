window.onload = () => {
  const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");
  const bannerInput = document.getElementById("banner");
  const bannerPreview = document.getElementById("banner-preview");

  function showLoading(selectElement, message = "Loading...") {
    selectElement.innerHTML = `<option value="">${message}</option>`;
    selectElement.disabled = true;
  }

  function enableSelect(selectElement, defaultText) {
    selectElement.disabled = false;
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
  }

  async function loadCountries() {
    showLoading(countrySelect, "Loading Countries...");
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
      const data = await response.json();

      if (data && data.data) {
        enableSelect(countrySelect, "Select Country");
        data.data.forEach(country => {
          const option = document.createElement("option");
          option.value = country.name;
          option.textContent = country.name;
          countrySelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      countrySelect.innerHTML = '<option value="">Failed to Load Countries</option>';
    }
  }

  countrySelect.addEventListener('change', async () => {
    const selectedCountry = countrySelect.value;
    if (!selectedCountry) return;

    showLoading(stateSelect, "Loading States...");
    citySelect.innerHTML = '<option value="">Select City</option>';
    citySelect.disabled = true;

    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry })
      });
      const data = await response.json();

      if (data && data.data && data.data.states) {
        enableSelect(stateSelect, "Select State");
        data.data.states.forEach(state => {
          const option = document.createElement("option");
          option.value = state.name;
          option.textContent = state.name;
          stateSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading states:', error);
      stateSelect.innerHTML = '<option value="">Failed to Load States</option>';
    }
  });

  stateSelect.addEventListener('change', async () => {
    const selectedCountry = countrySelect.value;
    const selectedState = stateSelect.value;
    if (!selectedState) return;

    showLoading(citySelect, "Loading Cities...");
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry, state: selectedState })
      });
      const data = await response.json();

      if (data && data.data) {
        enableSelect(citySelect, "Select City");
        data.data.forEach(city => {
          const option = document.createElement("option");
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      citySelect.innerHTML = '<option value="">Failed to Load Cities</option>';
    }
  });

  // Image preview
  bannerInput.addEventListener("change", () => {
    bannerPreview.src = bannerInput.value;
  });

  loadCountries();
};
