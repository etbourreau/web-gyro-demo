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
            msg: ref(""),
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
                return (
                    Math.round(
                        map(
                            this.getAvg("gamma"),
                            this.gyroRanges.gamma.min,
                            this.gyroRanges.gamma.max,
                            45,
                            -45
                        ) * 10
                    ) / 10
                );
            } else {
                return (
                    Math.round(
                        map(this.mouse.x, 0, window.innerWidth, -20, 20) * 10
                    ) / 10
                );
            }
        },
        getPageXRotation: function () {
            if (this.isMobile) {
                const range =
                    this.gyroRanges.beta.max - this.gyroRanges.beta.min;
                return (
                    Math.round(
                        map(
                            this.getAvg("beta") - this.gyroData.beta,
                            -range * 0.25,
                            range * 0.25,
                            90,
                            -90
                        ) * 10
                    ) / 10
                );
            } else {
                return (
                    Math.round(
                        map(this.mouse.y, 0, window.innerHeight, 10, -10) * 10
                    ) / 10
                );
            }
        },
        getAccentYRotation: function () {
            return this.getPageYRotation() * -1;
        },
        getAccentXRotation: function () {
            return this.getPageXRotation() * -1;
        },
    },
    template: `
    <div class="wrapper">
        <div class="page" :style="{
            transform: 'translateZ(-1rem) rotateY('+(getPageYRotation())+'deg) rotateX('+(getPageXRotation())+'deg)',
        }">
            <div class="vert-separator" />
            <div class="banner large" :style="{
                transform: 'translateZ(1rem) rotateX('+(getAccentXRotation())+'deg) rotateY('+(getAccentYRotation())+'deg)',
            }">
                <h1>LOREM IPSUM</h1>
            </div>
            <div class="visible-content d-flex flex-column" :style="{
                transform: 'translateZ(2rem) rotateX('+(getAccentXRotation())+'deg) rotateY('+(getAccentYRotation())+'deg)',
            }">
                <div class="spacer" />
                <h2 class="col-7">LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT</h2>
                <h3 class="col-5 mt-5">Suspendisse feugiat bibendum nibh, sit amet blandit ante porttitor a. Nullam elementum quam non semper consectetur.</h3>
                <h4 class="col-9 mt-5">Proin ut enim ut augue dictum malesuada. Proin porta congue nunc vel fringilla. Maecenas eleifend mollis sapien, quis iaculis turpis ultricies id. Sed sed tempor lectus. Nam dapibus metus ac quam efficitur, a eleifend ipsum hendrerit. In mollis sagittis pulvinar.</h4>
            </div>
        </div>
    </div>
    `,
}).mount("#app");
