package vip.xiaonuo.zj.modular.favorite.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vip.xiaonuo.auth.core.annotation.SaClientCheckLogin;
import vip.xiaonuo.common.pojo.CommonResult;
import vip.xiaonuo.zj.modular.favorite.param.ZjFavoriteToggleParam;
import vip.xiaonuo.zj.modular.favorite.service.ZjFavoriteService;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;

import java.util.List;

@Tag(name = "租迹收藏")
@RestController
@RequestMapping("/api/zj/favorites")
@SaClientCheckLogin
public class ZjFavoriteController {

    @Resource
    private ZjFavoriteService favoriteService;

    @Operation(summary = "收藏或取消收藏")
    @PostMapping("/toggle")
    public CommonResult<Boolean> toggle(@RequestBody @Valid ZjFavoriteToggleParam param) {
        return CommonResult.data(favoriteService.toggle(param.getListingId()));
    }

    @Operation(summary = "我的收藏")
    @GetMapping
    public CommonResult<List<ZjListing>> mine() {
        return CommonResult.data(favoriteService.myFavorites());
    }
}
