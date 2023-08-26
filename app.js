const { ref } = Vue;

const round = Math.round;
const map = (v2, s1, e1, s2, e2) => ((v2 - s1) * (e2 - s2)) / (e1 - s1) + s2;
const lerp = (a, b, t) => (1 - t) * a + t * b;

Vue.createApp({
    setup() {
        return {
            isMobile: false,
            gyroData: ref({
                beta: 0,
                betaDelayed: 0,
                gamma: 0,
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
            bgoffset: {
                x: 0,
                y: 0,
            },
            contentoffset: {
                x: 0,
                y: 0,
            },
            noiseoffset: ref({
                proc: null,
                x: 0,
                y: 0,
            }),
            mouse: ref({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            }),
            perspective: 200,
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
            const beta = this.gyroData.beta;
            setTimeout(() => {
                this.gyroData.betaDelayed = beta;
            }, 1000);
        }, 50);
        // creating noise movement
        const updateNoise = () => {
            const range = 1;
            const x =
                Math.round((Math.random() * range - range / 2) * 100) / 100;
            const y =
                Math.round((Math.random() * range - range / 2) * 100) / 100;
            for (let t = 0; t < 2000; t++) {
                setTimeout(() => {
                    this.noiseoffset.x = lerp(this.noiseoffset.x, x, 1 / 2000);
                    this.noiseoffset.y = lerp(this.noiseoffset.y, y, 1 / 2000);
                }, t + 1);
            }
        };
        this.noiseoffset.proc = setInterval(updateNoise, 2000);
        updateNoise();
    },
    watch: {
        "mouse.x": function (to) {
            this.updateOffsets();
        },
        "mouse.y": function (to) {
            this.updateOffsets();
        },
    },
    methods: {
        updateOffsets: function () {
            const beta = this.getPageXRotation();
            const betaRange =
                this.gyroRanges.beta.max - this.gyroRanges.beta.min;
            const betaPow = this.isMobile ? 20 : 20;
            this.bgoffset.y = map(
                beta,
                -betaRange / 2,
                betaRange / 2,
                -betaPow,
                betaPow
            );

            const gamma = this.getPageYRotation();
            const gammaPow = this.isMobile ? -10 : -10;
            this.bgoffset.x = map(
                gamma,
                this.gyroRanges.gamma.min,
                this.gyroRanges.gamma.max,
                -gammaPow,
                gammaPow
            );

            ["x", "y"].forEach((k) => {
                this.bgoffset[k] = Math.round(this.bgoffset[k] * 100) / 100;
            });

            this.contentoffset.x = -this.bgoffset.x;
            this.contentoffset.y = -this.bgoffset.y;
        },
        getPageYRotation: function () {
            if (this.isMobile) {
                return (
                    Math.round(
                        map(
                            this.gyroData.gamma,
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
                        map(this.mouse.x, 0, window.innerWidth, -10, 10) * 10
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
                            this.gyroData.beta - this.gyroData.betaDelayed,
                            -range / 2,
                            range / 2,
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
            return this.getPageYRotation() * 0.4;
        },
        getAccentXRotation: function () {
            return this.getPageXRotation() * 0.4;
        },
        getBGTransformStyle: function () {
            const parts = [];
            // offset
            const x = this.bgoffset.x + this.noiseoffset.x*.2;
            const y = this.bgoffset.y + this.noiseoffset.y*.2;
            parts.push(
                `translate3d(${x}rem, ${y}rem, ${-this.perspective}rem)`
            );
            // rotation Y
            parts.push(`rotateY(${this.getPageYRotation()}deg)`);
            // rotation X
            parts.push(`rotateX(${this.getPageXRotation()}deg)`);

            return parts.join(" ");
        },
        getContentTransformStyle: function (distance) {
            const parts = [];
            // offset
            const x = this.contentoffset.x - this.noiseoffset.x;
            const y = this.contentoffset.y - this.noiseoffset.y;
            parts.push(
                `translate3d(${x}rem, ${y}rem, ${-distance}rem)`
            )
            // rotation Y
            parts.push(`rotateY(${this.getPageYRotation()}deg)`);
            // rotation X
            parts.push(`rotateX(${this.getPageXRotation()}deg)`);
            
            return parts.join(" ");
        },
    },
    template: `
    <div class="wrapper" :style="{
        perspective: perspective+'rem',
    }">
        <div class="page">
            <div class="bg" :style="{
                transform: getBGTransformStyle(),
            }" />
            <div class="vert-separator" />
            <div class="banner large" :style="{
                transform: getContentTransformStyle(perspective/4),
            }">
                <h1>LOREM IPSUM</h1>
            </div>
            <div class="visible-content d-flex flex-column" :style="{
                transform: getContentTransformStyle(perspective/8),
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
