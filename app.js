const coins = [
  {
    id: "monero",
    symbol: "XMR",
    name: "Monero",
    yield: 0.00025
  },

  {
    id: "ravencoin",
    symbol: "RVN",
    name: "Ravencoin",
    yield: 8
  },

  {
    id: "ergo",
    symbol: "ERG",
    name: "Ergo",
    yield: 0.08
  },

  {
    id: "kaspa",
    symbol: "KAS",
    name: "Kaspa",
    yield: 3
  }
];


const $ = id => document.getElementById(id);


const money = value => {

  return new Intl.NumberFormat("en-US", {

    style: "currency",

    currency: "USD",

    maximumFractionDigits: 4

  }).format(value || 0);

};


function electricityCost() {

  const electricity =
    Number($("electricity").value) || 0;

  const watts =
    Number($("watts").value) || 0;

  const hours =
    Number($("hours").value) || 0;

  return (
    (watts / 1000) *
    hours *
    electricity
  );

}


async function getPrices() {

  try {

    const ids = coins
      .map(coin => coin.id)
      .join(",");

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=" +
      ids +
      "&vs_currencies=usd"
    );

    if (!response.ok) {

      throw new Error("Price API failed");

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return {};

  }

}


async function render() {

  const prices = await getPrices();

  const powerCost = electricityCost();

  $("dailyPower").textContent =
    money(powerCost);


  let bestCoin = null;

  let bestProfit = -Infinity;


  $("coinTable").innerHTML = "";


  coins.forEach((coin, index) => {

    const price =
      prices[coin.id]?.usd || 0;

    const revenue =
      price * coin.yield;

    const profit =
      revenue - powerCost;


    if (profit > bestProfit) {

      bestProfit = profit;

      bestCoin = coin;

    }


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>

        <span class="coin-name">
          ${coin.name}
        </span>

        <span class="symbol">
          ${coin.symbol}
        </span>

      </td>


      <td>
        ${money(price)}
      </td>


      <td>

        <input
          class="yield"
          data-index="${index}"
          type="number"
          min="0"
          step="any"
          value="${coin.yield}"
        />

      </td>


      <td>
        ${money(revenue)}
      </td>


      <td>
        ${money(powerCost)}
      </td>


      <td class="${profit >= 0 ? "positive" : "negative"}">

        ${money(profit)}

      </td>

    `;


    $("coinTable").appendChild(row);

  });


  if (bestCoin) {

    $("bestCoin").textContent =
      bestCoin.symbol;

    $("bestProfit").textContent =
      money(bestProfit);

    $("monthlyProfit").textContent =
      money(bestProfit * 30);

  }


  document
    .querySelectorAll(".yield")
    .forEach(input => {

      input.addEventListener(
        "input",
        event => {

          const index =
            Number(event.target.dataset.index);

          coins[index].yield =
            Number(event.target.value) || 0;

          render();

        }
      );

    });

}


$("refresh")
  .addEventListener("click", render);


["electricity", "watts", "hours"]
  .forEach(id => {

    $(id).addEventListener(
      "input",
      render
    );

  });


render();