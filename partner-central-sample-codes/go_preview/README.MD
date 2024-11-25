Open package in VSCode inside go_preview directory
    
    code .

To avoid GOPROXY flag proxy.golang.org error, run the following commands:

    export GOPROXY=direct

    go clean --modcache

    go get -u

    go build

Run code by executing the following command inside each use case directory:
    
    cd list_opportunities

    go run list_opportunities.go
