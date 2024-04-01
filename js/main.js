let container = document.querySelector('#container');
let answers = {
	answer_1: '',
	answer_2: '',
	answer_3: '',
};
let currentQuestionIndex = 0;
let dataQuestions = [];

const fetchProduct = async () => {
	try {
		const res = await fetch('./data/products.json');
		const dataProducts = await res.json();
		return dataProducts;
	} catch (error) {
		console.log(error);
	}
};

const filterProductsByAnswers = (products, obj) => {
	console.log('obj', obj);
	const filteredProducts = [];
	const priceRange = obj.answer_3.split('-').map((val) => parseFloat(val));
	const minPrice = priceRange[0];
	const maxPrice = priceRange[1];
	console.log(products)
	for (const product of products) {
		if (product.category.some((cat) => cat.toLowerCase().includes(obj.answer_1.toLowerCase()))) {
			if (product.colors.some((color) => color.toLowerCase().includes(obj.answer_2.toLowerCase()))) {
				 const productPrice = parseFloat(product.price);
					if (!isNaN(productPrice) && productPrice >= minPrice && productPrice <= maxPrice) {
						filteredProducts.push(product);
					}
			}
		}
	}

	return filteredProducts;
};







const generateSteps = (count, stepsContainer, currentIndex) => {
	stepsContainer.innerHTML = '';
	let visibleStepCount = 10;
	const startIndex = Math.max(0, currentQuestionIndex - visibleStepCount / 2);
	const endIndex = Math.min(count, startIndex + visibleStepCount);

	for (let i = startIndex; i < endIndex; i++) {
		const stepDiv = document.createElement('div');
		stepDiv.classList.add('step');
		if (i === currentIndex) {
				stepDiv.style.backgroundColor = 'gray';
		}

		stepsContainer.appendChild(stepDiv);
	}
};

const getProducts = async (obj) => {
	try {
		const dataProducts = await fetchProduct();
		const filteredProducts = filterProductsByAnswers(dataProducts,obj);
		let sliderItemsHTML = `
                   <div class="loader-container">
				    <div class="loader"></div>
					<div>Products listing..</div>
				   </div>
        `;
		container.innerHTML = sliderItemsHTML;
		setTimeout(() => {
			sliderItemsHTML = '';
			if (filteredProducts.length != 0) {
				filteredProducts.forEach((product,index) => {
					sliderItemsHTML += `
					<div class="slider-item slider-item-${product.productId}">
						<img src="${product.image}" alt="${product.name}" loading="lazy"/>
						<div class="info-container">
							<h1 class="title">${product.name}</h1>
							<p class="oldPrice"> <span>${product.oldPrice ? product.currency : ""}</span> ${product.oldPrice ? product.oldPrice :""}</p>
							<p class="price"><span>${product.currency}</span> ${product.price}</p>
						</div>
						<div class="steps" id="steps-${index}"></div>
						<button class="btn">VIEW PRODUCT</button>
					</div>

					`;
				});


			} else {
				sliderItemsHTML = `
					<div class="slider-item">
						<div class="noFound">
						No Product Found
						</div>
					</div>`;
			}
			container.innerHTML = sliderItemsHTML;

			$('.slider-container').slick({
				arrows: true,
				dots: false,
				fade: true,
				infinite: true,
				lazyLoad: 'ondemand',
				responsive: [],
			});
			filteredProducts.forEach((product, index) => {
				const stepsContainer = document.getElementById(`steps-${index}`);
				generateSteps(filteredProducts.length, stepsContainer, index);
			});
		}, 2000);

	} catch (error) {
		console.log(error);
	}
};

const checkCategory = (e) => {
	e.stopPropagation();
	const questionIndex = parseInt(e.target.getAttribute('data-id'));
	const answer = e.target.getAttribute('data-name');

	if (questionIndex === 0) {
		answers.answer_1 = answer;
	} else if (questionIndex === 1) {
		answers.answer_2 = answer;
	} else {
		answers.answer_3 = answer;
	}
	console.log(answers);
};

const setActive = (divEl) => {
	const allDivs = document.querySelectorAll('.answer');
	allDivs.forEach((el) => {
		el.classList.remove('active');
	});
	divEl.classList.add('active');
};




const renderQuestion = (questionIndex) => {
	container.innerHTML = '';
	const question = dataQuestions[ currentQuestionIndex ].steps[ questionIndex ];
	const sliderItemHTML = `
        <div class="slider-item question-${questionIndex}">
            <h2 class="subtitle">${question.subtitle}</h2>
            <h1 class="title">${question.title}</h1>
                <div class="div-${currentQuestionIndex}">
				${question.answers
					.map(
						(answer) =>
							`<div class="answer" data-id="${currentQuestionIndex}" onclick="checkCategory(event),setActive(this)" data-name="${answer}">
						${currentQuestionIndex === 2 ? '€' : ''} ${currentQuestionIndex === 1 ? '' : answer}</div>`,
					)
					.join('')}
				</div>
            <button id="prevButton" class="btn" onclick="handlePrevClick()">Back</button>
            <button id="nextButton" class="btn" onclick="handleNextClick()">Next</button>
			<div class="steps">
			</div>
        </div>
    `;

	container.innerHTML = sliderItemHTML;

	if ($('.slider-container').hasClass('slick-initialized')) {
		$('.slider-container').slick('unslick');
	}

	document.getElementById('nextButton').onclick = handleNextClick;
	document.getElementById('prevButton').onclick = handlePrevClick;
	document.getElementsByClassName('.answer').onclick = setActive;
	const questionLength = dataQuestions[ currentQuestionIndex ].steps.length;
	const stepsContainer = document.querySelector('.steps');
	generateSteps(questionLength, stepsContainer, currentQuestionIndex);

};

var handlePrevClick = () => {
	if (currentQuestionIndex > 0) {
		currentQuestionIndex--;
		renderQuestion(currentQuestionIndex);
	}
};




var handleNextClick = () => {
	if (currentQuestionIndex < dataQuestions[currentQuestionIndex].steps.length - 1) {
		currentQuestionIndex++;
		renderQuestion(currentQuestionIndex);
	}
	if (Object.values(answers).every((value) => value !== '')) {
		getProducts (answers);
	}
};

const getQuestions = async () => {
	try {
		const res = await fetch('./data/questions.json');
		dataQuestions = await res.json();
		console.log(dataQuestions);
		renderQuestion(currentQuestionIndex);
	} catch (error) {
		console.log(error);
	}
};

getQuestions();
fetchProduct();
