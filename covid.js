const getCovid = async () => {
  const covidData = [];

  const helpers = {};

  helpers.setAttribute = (el, attr) => {
    if (el) {
      el.setAttribute("id", attr);
    }
  };

  helpers.randomColor = () => {
    return covidData.countries.map((el) => {
      let r, g, b;
      r = Math.random() * (254 - 0) + 0;
      g = Math.random() * (254 - 0) + 0;
      b = Math.random() * (254 - 0) + 0;

      return `rgb(${r},${g},${b})`;
    });
  };

  const getCountryNames = () => {
    return covidData.countries.map((country) => {
      return country.name;
    });
  };

  const getTypeOfStats = (type) => {
    switch (type) {
      case "deaths":
        return covidData.countries.map((country) => {
          return country.latestData.deaths;
        });
      case "recovered":
        return covidData.countries.map((country) => {
          return country.latestData.recovered;
        });
      case "confirmed":
        return covidData.countries.map((country) => {
          return [country.latestData.confirmed];
        });
      case "critical":
        return covidData.countries.map((country) => {
          return country.latestData.critical;
        });
    }
  };

  const displayCountries = () => {
    const target = document.querySelector("ul");
    target.innerHTML = "";

    covidData.countries.forEach((country) => {
      const el = document.createElement("li");
      el.classList.add("list");
      el.innerHTML = country.name;
      el.addEventListener("click", () => fetchCountryDetails(country.code));
      target.appendChild(el);
    });
  };

  const fetchCountryDetails = async (code) => {
    const req = await fetch(
      `https://cors-anywhere.herokuapp.com/corona-api.com/countries/${code}`
    );
    const resData = await req.json();
    const data = resData.data;
    helpers.setAttribute(container, "none");

    displayCountryDetails(data);
  };

  const displayCountryDetails = (data) => {
    document.querySelector(".details").classList.remove("none");

    document.querySelector(".total-cases").innerHTML =
      data.latest_data.confirmed;

    document.querySelector(".new-cases").innerHTML = data.today.confirmed;

    document.querySelector(".total-deaths").innerHTML = data.latest_data.deaths;

    document.querySelector(".total-recovered").innerHTML =
      data.latest_data.recovered;

    document.querySelector(".new-deaths").innerHTML = data.today.deaths;

    document.querySelector(".critical").innerHTML = data.latest_data.critical;
  };

  const getTargetedCountries = async (continent) => {
    helpers.setAttribute(document.querySelector("#none"), "myChart");

    document.querySelector(".details").classList.add("none");
    let countries;
    let dataCountries;
    covidData.targetedCountries = [];
    if (continent === "world") {
      countries = await fetch(
        "https://cors-anywhere.herokuapp.com/corona-api.com/countries"
      );
      dataCountries = await countries.json();
      dataCountries.data.forEach((country) => {
        covidData.targetedCountries.push(country.name);
      });
    } else {
      countries = await fetch(
        `https://cors-anywhere.herokuapp.com/restcountries.herokuapp.com/api/v1/region/${continent}`
      );
      dataCountries = await countries.json();
      dataCountries.forEach((country) => {
        covidData.targetedCountries.push(country.name.common);
      });
    }
    getContinentData();
  };

  const getContinentData = async () => {
    covidData.countries = [];

    const req = await fetch("https://corona-api.com/countries");
    const result = await req.json();

    covidData.targetedCountries.forEach((targetCountry) => {
      result.data.forEach((country) => {
        if (!(country.name === targetCountry)) {
          return;
        } else {
          const countryData = {
            name: country.name,
            latestData: country.latest_data,
            code: country.code,
          };

          covidData.countries.push(countryData);
        }
      });
    });
    document.querySelector(".options").classList.remove("hidden");
    displayCountries();

    continentChart("confirmed");
  };

  // function addData(chart, label, data) {
  //   chart.data.labels.push(label);
  //   chart.data.datasets.forEach((dataset) => {
  //     dataset.data.push(data);
  //   });
  //   chart.update();
  // }

  // function removeData(chart) {
  //   chart.data.labels.pop();
  //   chart.data.datasets.forEach((dataset) => {
  //     dataset.data.pop();
  //   });
  //   chart.update();
  // }

  continentChart = (type) => {
    const option = getTypeOfStats(type);
    if (document.querySelector("#myChart")) {
      document.querySelector("#myChart").remove();
      const canvas = document.createElement("canvas");
      canvas.id = "myChart";
      document.querySelector(".canvas-container").appendChild(canvas);
    }
    const ctx = document.getElementById("myChart").getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: getCountryNames(),
        datasets: [
          {
            label: `Covid 19 ${type}`,
            backgroundColor: helpers.randomColor()[0],
            borderColor: "red",
            pointBackgroundColor: helpers.randomColor(),
            data: option,
          },
        ],
      },
    });
    // removeData(chart);
    // addData(chart, getCountryNames(), option);
  };

  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.hasAttribute("data-continent")) {
      button.addEventListener("click", (e) =>
        getTargetedCountries(e.target.getAttribute("data-continent"))
      );
    } else {
      button.addEventListener("click", (e) =>
        continentChart(e.target.getAttribute("data-type"))
      );
    }
  });
};
getCovid();

//european countries https://github.com/hengkiardo/restcountries
// api https://about-corona.net/documentation
