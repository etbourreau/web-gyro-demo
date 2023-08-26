const { ref } = Vue;

const round = Math.round;
const map = (v2, s1, e1, s2, e2) => ((v2 - s1) * (e2 - s2)) / (e1 - s1) + s2;

Vue.createApp({
    setup() {
        return {
            isMobile: false,
            gyroData: ref({
                beta: 0,
                betaDelayed: 0,
                gamma: 0,
                gammaDelayed: 0,
            }),
            gyroRanges: {
                beta: {
                    min: -180,
                    max: 180,
                },
                gamma: {
                    min: -90,
                    max: 90,
                },
            },
            mouse: ref({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            }),
        };
    },
    mounted() {
        this.gyro = new GyroNorm();
        this.gyro
            .init({
                frequency: 30,
                gravityNormalized: true,
                orientationBase: GyroNorm.GAME,
                decimalCount: 2,
                logger: (...data) => console.log("GyroNorm", ...data),
                screenAdjusted: false,
            })
            .then(() => {
                this.isMobile = true;
                this.gyro.start((data) => {
                    this.gyroData.beta = round(data.do.beta);
                    this.gyroData.gamma = round(data.do.gamma);
                });
            })
            .catch((e) => {});
        // mouse listening
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        // creating movement delayed values
        setInterval(() => {
            const beta = this.gyroData.beta,
                gamma = this.gyroData.gamma;
            setTimeout(() => {
                this.gyroData.betaDelayed = beta;
                this.gyroData.gammaDelayed = gamma;
            }, 500);
        }, 50);

        ondevicemotion = (e) => {
            this.aclData = e;
        };
    },
    methods: {
        getAvg: function (k) {
            const current = this.gyroData[k];
            const delayed = this.gyroData[k + "Delayed"];
            const min = this.gyroRanges[k].min;
            const max = this.gyroRanges[k].max;
            const range = max - min;
            const middle = (min + max) / 2;
            const margin = range * 0.1;
            const computedDelayed =
                current < min + margin && delayed > middle
                    ? delayed - range
                    : current > max - margin && delayed < middle
                    ? delayed + range
                    : delayed;
            let avg = (current + computedDelayed) / 2;
            return avg + (avg < min ? range : avg > max ? -range : 0);
        },
        getPageYRotation: function () {
            if (this.isMobile) {
                const range =
                    this.gyroRanges.gamma.max - this.gyroRanges.gamma.min;
                const middle =
                    (this.gyroRanges.gamma.min + this.gyroRanges.gamma.max) / 2;
                return (
                    Math.round(
                        map(
                            this.getAvg("gamma") - this.gyroData.gamma,
                            middle - range / 8,
                            middle + range / 8,
                            45,
                            -45
                        ) * 10
                    ) / 10
                );
            } else {
                return (
                    Math.round(
                        map(this.mouse.x, 0, window.innerWidth, -10, 10) * 10
                    ) / 10
                );
            }
        },
        getPageXRotation: function () {
            if (this.isMobile) {
                const range =
                    this.gyroRanges.beta.max - this.gyroRanges.beta.min;
                const middle =
                    (this.gyroRanges.beta.min + this.gyroRanges.beta.max) / 2;
                return (
                    Math.round(
                        map(
                            this.getAvg("beta") - this.gyroData.beta,
                            middle - range / 8,
                            middle + range / 8,
                            90,
                            -90
                        ) * 10
                    ) / 10
                );
            } else {
                return (
                    Math.round(
                        map(this.mouse.y, 0, window.innerHeight, 7, -7) * 10
                    ) / 10
                );
            }
        },
        getAccentYRotation: function () {
            return this.getPageYRotation() * .4;
        },
        getAccentXRotation: function () {
            return this.getPageXRotation() * .4;
        },
    },
    template: `
    <div class="wrapper">
        <div class="page">
            <div class="bg" :style="{
                transform: 'translateZ(-200rem) rotateY('+(getPageYRotation())+'deg) rotateX('+(getPageXRotation())+'deg)',
            }" />
            <div class="vert-separator" />
            <div class="banner large" :style="{
                transform: 'translateZ(150rem) rotateX('+(getAccentXRotation())+'deg) rotateY('+(getAccentYRotation())+'deg)',
            }">
                <h1>LOREM IPSUM</h1>
            </div>
            <div class="visible-content d-flex flex-column" :style="{
                transform: 'translateZ(175rem) rotateX('+(getAccentXRotation())+'deg) rotateY('+(getAccentYRotation())+'deg)',
            }">
                <div class="spacer" />
                <div class="flex-grow-1 d-flex flex-column justify-content-evenly">
                    <h2 class="col-12 col-md-8 mt-3">LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT</h2>
                    <h3 class="col-12 col-md-8 mt-3">Suspendisse feugiat bibendum nibh, sit amet blandit ante porttitor a. Nullam elementum quam non semper consectetur.</h3>
                    <h4 class="col-12 col-md-8 mt-3">Proin ut enim ut augue dictum malesuada. Proin porta congue nunc vel fringilla. Maecenas eleifend mollis sapien, quis iaculis turpis ultricies id. Sed sed tempor lectus. Nam dapibus metus ac quam efficitur, a eleifend ipsum hendrerit. In mollis sagittis pulvinar.</h4>
                </div>
            </div>
        </div>
    </div>
    `,
}).mount("#app");
